import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { Save } from "lucide-react";
import toast from "react-hot-toast";
import FormInput from "../../../components/form-field/input-field/InputController";
import FormSelect from "../../../components/form-field/input-select/SelectController";
import MultiImageUpload, {
  type ImagePreview,
} from "../../../components/form-field/MultiImageUpload";
import useGetVersionOptions from "../../../lib/hooks/use-get-version-options";
import { useApiMutation } from "../../../lib/use-api-mutation";
import { ApiError } from "../../../lib/api-client";
import {
  GALLERY_MAX_IMAGES,
  type GalleryItem,
} from "../../../types/gallery";
import Divider from "../../../shared/design-components/divider/Divider";
import { Text } from "../../../shared/design-components";

interface GalleryFormValues {
  flagshipEventVersionId: string;
  link: string;
}

const LIST_PATH = "/content-management/gallery";

interface NewImage {
  key: string;
  file: File;
  url: string;
}

export default function GalleryForm() {
  const navigate = useNavigate();

  const { options: versionOptions, isLoading: versionsLoading } =
    useGetVersionOptions({ status: null });

  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const keyCounter = useRef(0);

  const methods = useForm<GalleryFormValues>({
    defaultValues: { flagshipEventVersionId: "", link: "" },
  });
  const { handleSubmit } = methods;

  // Revoke object URLs on unmount to avoid leaks.
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = (files: File[]) => {
    setNewImages((prev) => {
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
          file,
          url: URL.createObjectURL(file),
        })),
      ];
    });
  };

  const handleRemove = (key: string) => {
    setNewImages((prev) => {
      const target = prev.find((img) => img.key === key);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((img) => img.key !== key);
    });
  };

  const previews: ImagePreview[] = newImages.map((img) => ({
    key: img.key,
    url: img.url,
  }));

  const { execute: createGallery, isLoading: isCreating } = useApiMutation(
    "gallery",
  )<{ data: GalleryItem }, FormData>({
    method: "POST",
    invalidateRoutes: ["gallery", "galleryByVersion"],
    onSuccess: () => {
      toast.success("Gallery created successfully");
      navigate(LIST_PATH);
    },
    onError: (err: ApiError) =>
      toast.error(err.message || "Failed to create gallery"),
  });

  const onSubmit = async (values: GalleryFormValues) => {
    if (newImages.length === 0) {
      toast.error("Please upload at least 1 image to the gallery.");
      return;
    }

    const formData = new FormData();
    formData.append("flagshipEventVersionId", values.flagshipEventVersionId);
    if (values.link.trim()) {
      // One link is applied to all images uploaded in this request.
      formData.append("link", values.link.trim());
    }
    // Field name is literally `image`, repeated per file.
    newImages.forEach((img) => formData.append("image", img.file));

    await createGallery(formData);
  };

  return (
    <div className="bg-surface border border-border rounded-lg w-full shadow-sm">
      {/* Header */}
      <div className="flex justify-between p-6 shrink-0">
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-xl font-bold">Add Gallery Images</h1>
          <Text size="sm" variant="muted">
            Upload 1–{GALLERY_MAX_IMAGES} images for a version. If the version
            already has a gallery, these are appended. Per-image links can be
            set afterwards by editing the gallery.
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

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            {/* Version + link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                name="flagshipEventVersionId"
                label="Version"
                options={versionOptions}
                placeholder="Select a version"
                rules={{ required: "Please select a version" }}
                isLoading={versionsLoading}
              />
              <FormInput
                name="link"
                label="Link (applied to all)"
                placeholder="https://…"
                rules={{
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: "Must be a valid URL (http:// or https://)",
                  },
                }}
              />
            </div>

            <Divider />

            {/* Images */}
            <MultiImageUpload
              label={`Images (${newImages.length}/${GALLERY_MAX_IMAGES})`}
              isRequired
              hint="SVG, PNG, or JPG. Up to 7 images."
              previews={previews}
              onAdd={handleAdd}
              onRemove={handleRemove}
            />
          </div>

          {/* Fixed footer */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-surface px-6 py-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Save size={16} />
              )}
              <span>Create Gallery</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
