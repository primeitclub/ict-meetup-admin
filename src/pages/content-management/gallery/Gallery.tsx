import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Plus, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../../components/table/Table";
import TableRowActions from "../../../components/table/TableRowActions";
import { useApiQuery } from "../../../lib";
import { useApiMutation } from "../../../lib/use-api-mutation";
import { useVersionFilter } from "../../../lib/hooks/use-version-filter";
import VersionSelectFilter from "../../../components/VersionSelectFilter";
import ConfirmDialog from "../../../shared/design-components/dialog/ConfirmDialog";
import { normalizeGalleryImages, type GalleryItem } from "../../../types/gallery";

export default function Gallery() {
  const navigate = useNavigate();
  const { selectedVersionId, setSelectedVersionId, versionOptions, versionsLoading } =
    useVersionFilter();

  const { data, isLoading, refetch } = useApiQuery("gallery")<{
    data: { items: GalleryItem[] };
  }>();

  const versionNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of versionOptions) {
      map.set(v.value, v.label);
    }
    return map;
  }, [versionOptions]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null);

  const { execute: deleteGallery, isLoading: isDeleting } = useApiMutation(
    "galleryByVersion",
  )<void, never>({
    method: "DELETE",
    onSuccess: () => refetch(),
    onError: (error) =>
      toast.error(error.message || "Failed to delete gallery"),
  });

  const handleDelete = useCallback(
    (versionId: string) => {
      setDeleteVersionId(versionId);
      setConfirmOpen(true);
    },
    [setDeleteVersionId, setConfirmOpen],
  );

  const handleConfirmDelete = async () => {
    if (!deleteVersionId) return;
    try {
      await deleteGallery(undefined, {
        pathParams: { versionId: deleteVersionId },
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns: ColumnDef<GalleryItem>[] = useMemo(
    () => [
      {
        id: "sn",
        header: "S.N",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "image",
        header: "Image",
        cell: ({ row }) => {
          const images = normalizeGalleryImages(row.original);
          return images.length ? (
            <img
              src={images[0].cloudImageUrl}
              alt="Gallery"
              className="h-10 w-10 rounded-md object-cover border border-border"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground">
              <ImageIcon size={14} />
            </div>
          );
        },
      },
      {
        id: "version",
        header: "Version",
        cell: ({ row }) =>
          versionNameById.get(row.original.flagshipEventVersionId) ??
          row.original.flagshipEventVersionId,
      },
      {
        id: "imageCount",
        header: "Images",
        cell: ({ row }) => normalizeGalleryImages(row.original).length,
      },
      {
        accessorKey: "updatedAt",
        header: "Last Updated",
        cell: ({ row }) =>
          new Date(row.getValue("updatedAt")).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TableRowActions
            editHref={`edit/${row.original.flagshipEventVersionId}`}
            onDelete={() => handleDelete(row.original.flagshipEventVersionId)}
          />
        ),
      },
    ],
    [handleDelete, versionNameById],
  );

  const allItems = data?.data?.items ?? [];
  const items = selectedVersionId
    ? allItems.filter((i) => i.flagshipEventVersionId === selectedVersionId)
    : allItems;

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={items}
        onRefetch={refetch}
        searchPlaceholder="Search gallery..."
        actionRight={
          <div className="flex items-center gap-3">
            <VersionSelectFilter
              value={selectedVersionId}
              onChange={setSelectedVersionId}
              options={versionOptions}
              isLoading={versionsLoading}
            />
            <button
              onClick={() => navigate("add")}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add gallery item
            </button>
          </div>
        }
      />
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete gallery?"
        description="This will permanently delete this version's entire gallery and all its images. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
