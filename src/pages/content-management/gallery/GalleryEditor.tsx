import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImagePlus, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { useApiQuery } from "../../../lib";
import { useApiMutation } from "../../../lib/use-api-mutation";
import { ApiError } from "../../../lib/api-client";
import useGetVersions from "../../../lib/hooks/use-get-versions";
import {
  GALLERY_MAX_IMAGES,
  GALLERY_MIN_IMAGES,
  type GalleryImage,
  type GalleryItem,
} from "../../../types/gallery";
import Divider from "../../../shared/design-components/divider/Divider";
import { getImageUrl } from "../../../utils/imageUtils";
import { isImageSizeValid, imageSizeErrorMessage } from "../../../utils/fileValidation";
import ConfirmDialog from "../../../shared/design-components/dialog/ConfirmDialog";
import { Text } from "../../../shared/design-components";
import { cn } from "../../../shared/utils/cn";

const LIST_PATH = "/content-management/gallery";

interface EditorImage {
  key: string;
  /** Present for existing (saved) images; absent for newly added ones. */
  id?: string;
  url: string;
  file?: File;
  link: string;
}

function toEditorImages(images: GalleryImage[], seed: number): EditorImage[] {
  return images.map((img, i) => ({
    key: `existing-${seed}-${i}-${img.id}`,
    id: img.id,
    url: getImageUrl(img.imagePath),
    link: img.link ?? "",
  }));
}

export default function GalleryEditor() {
  const navigate = useNavigate();
  const { versionId } = useParams<{ versionId: string }>();

  const { data: versionsData } = useGetVersions();
  const versionName = useMemo(() => {
    const v = (versionsData?.data?.items ?? []).find(
      (x) => x.id === versionId,
    );
    return v?.version_name ?? "";
  }, [versionsData, versionId]);

  const { data, isLoading, isError, error } = useApiQuery(
    "galleryByVersion",
  )<{ data: GalleryItem }>({
    pathParams: { versionId: versionId as string },
    enabled: !!versionId,
    config: { retry: false },
  });

  const [images, setImages] = useState<EditorImage[]>([]);
  // One link is applied to every image in the gallery.
  const [link, setLink] = useState("");
  const initialized = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyCounter = useRef(0);

  // Seed local state from the server once (and after explicit save/delete the
  // mutation responses update it directly).
  useEffect(() => {
    if (initialized.current || !data?.data) return;
    const seeded = toEditorImages(data.data.images ?? [], (keyCounter.current += 1));
    setImages(seeded);
    // Adopt the first existing link as the shared link.
    setLink(seeded.find((img) => img.link)?.link ?? "");
    initialized.current = true;
  }, [data]);

  // Revoke object URLs for newly-added files on unmount.
  useEffect(() => {
    return () => {
      images.forEach((img) => img.file && URL.revokeObjectURL(img.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savedCount = images.filter((img) => img.id).length;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  const { execute: saveGallery, isLoading: isSaving } = useApiMutation(
    "galleryByVersion",
  )<{ data: GalleryItem }, FormData>({
    method: "PUT",
    pathParams: { versionId: versionId as string },
    onSuccess: () => {
      toast.success("Gallery saved successfully");
      navigate(LIST_PATH);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to save gallery"),
  });

  const { execute: deleteImage, isLoading: isDeleting } = useApiMutation(
    "galleryImage",
  )<{ data: GalleryItem }, never>({
    method: "DELETE",
    onSuccess: (res) => {
      toast.success("Image removed");
      // Re-seed saved images from the response; keep any unsaved new ones.
      setImages((prev) => {
        const unsaved = prev.filter((img) => !img.id);
        return [
          ...toEditorImages(res.data.images ?? [], (keyCounter.current += 1)),
          ...unsaved,
        ];
      });
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to remove image"),
  });

  const handleAddFiles = (rawFiles: File[]) => {
    const oversized = rawFiles.filter((f) => !isImageSizeValid(f));
    if (oversized.length) toast.error(imageSizeErrorMessage(oversized[0]));
    const files = rawFiles.filter((f) => isImageSizeValid(f));
    if (!files.length) return;

    setImages((prev) => {
      const room = GALLERY_MAX_IMAGES - prev.length;
      if (room <= 0) {
        toast.error(`A maximum of ${GALLERY_MAX_IMAGES} images is allowed`);
        return prev;
      }
      const accepted = files.slice(0, room);
      if (accepted.length < files.length) {
        toast.error(`A maximum of ${GALLERY_MAX_IMAGES} images is allowed`);
      }
      return [
        ...prev,
        ...accepted.map((file) => ({
          key: `new-${(keyCounter.current += 1)}`,
          url: URL.createObjectURL(file),
          file,
          link: "",
        })),
      ];
    });
  };

  const handleRemove = (img: EditorImage) => {
    if (img.id) {
      // Existing image → instant delete via the API (blocked below 1).
      setDeleteImageId(img.id);
      setConfirmOpen(true);
      return;
    }
    // Unsaved new image → drop locally.
    setImages((prev) => {
      URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.key !== img.key);
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteImageId) return;
    try {
      await deleteImage(undefined, {
        pathParams: { versionId: versionId as string, imageId: deleteImageId },
      });
    } finally {
      setConfirmOpen(false);
      setDeleteImageId(null);
    }
  };

  const handleSave = async () => {
    if (images.length < GALLERY_MIN_IMAGES) {
      toast.error("Please upload at least 1 image to the gallery.");
      return;
    }
    if (images.length > GALLERY_MAX_IMAGES) {
      toast.error(`A maximum of ${GALLERY_MAX_IMAGES} images can be uploaded.`);
      return;
    }

    const formData = new FormData();
    // `data` describes the desired final list. New (no-id) items consume the
    // appended files in the same order they appear here. One link is applied
    // to every image.
    const sharedLink = link.trim();
    const desired: { id?: string; link: string }[] = [];
    for (const img of images) {
      if (img.id) {
        desired.push({ id: img.id, link: sharedLink });
      } else if (img.file) {
        formData.append("image", img.file);
        desired.push({ link: sharedLink });
      }
    }
    formData.append("data", JSON.stringify(desired));

    await saveGallery(formData);
  };

  const atMax = images.length >= GALLERY_MAX_IMAGES;

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      {/* Header */}
      <div className="flex justify-between p-6 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold">Edit Gallery</h1>
          <Text size="sm" variant="muted">
            {versionName ? `Version: ${versionName}. ` : ""}
            Manage images and per-image links. {GALLERY_MIN_IMAGES}–
            {GALLERY_MAX_IMAGES} images.
          </Text>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Back
        </button>
      </div>

      <Divider />

      <div className="p-6 space-y-6">
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && isError && (
          <div className="rounded-lg border border-border bg-surface-2 p-6 text-center">
            <Text size="sm" variant="muted">
              {error?.message ?? "No gallery found for this version yet."}
            </Text>
            <button
              type="button"
              onClick={() => navigate("/content-management/gallery/add")}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              <ImagePlus size={16} />
              Upload images
            </button>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* One link applied to all images */}
            <div className="space-y-1.5">
              <Text size="sm" variant="muted">
                Link (applied to all)
              </Text>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://… (optional)"
                className={cn(
                  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm",
                  "focus:border-accent focus:outline-none",
                )}
              />
            </div>

            <Divider />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Text size="sm" variant="muted">
                  Images ({images.length}/{GALLERY_MAX_IMAGES})
                </Text>
                <Text size="xs" variant="muted">
                  SVG, PNG, or JPG · max 150 KB each
                </Text>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={atMax}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:border-accent hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImagePlus size={16} />
                Add images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (files.length) handleAddFiles(files);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img) => {
                const canDeleteExisting =
                  !img.id || savedCount > GALLERY_MIN_IMAGES;
                return (
                  <div
                    key={img.key}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="relative">
                      <img
                        src={img.url}
                        alt="Gallery"
                        className="h-32 w-full rounded-md object-cover border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemove(img)}
                        disabled={!canDeleteExisting}
                        title={
                          canDeleteExisting
                            ? "Remove image"
                            : "A gallery must keep at least 1 image"
                        }
                        className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-red-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {img.id ? <Trash2 size={14} /> : <X size={14} />}
                      </button>
                      {!img.id && (
                        <span className="absolute bottom-2 left-2 rounded bg-accent/90 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {images.length === 0 && (
              <Text size="sm" variant="muted">
                No images. Add at least one before saving.
              </Text>
            )}
          </>
        )}
      </div>

      {/* Fixed footer */}
      {!isLoading && !isError && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || images.length < GALLERY_MIN_IMAGES}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Save size={16} />
            )}
            <span>Save Gallery</span>
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove image?"
        description="This permanently deletes the image and its file. This action cannot be undone."
        confirmLabel="Remove"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
