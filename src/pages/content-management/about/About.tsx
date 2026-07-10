import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../../utils/imageUtils";
import { Plus, ImageIcon } from "lucide-react";
import Table from "../../../components/table/Table";
import TableRowActions from "../../../components/table/TableRowActions";
import { useApiQuery } from "../../../lib";
import { useApiMutation } from "../../../lib/use-api-mutation";
import { useVersionFilter } from "../../../lib/hooks/use-version-filter";
import VersionSelectFilter from "../../../components/VersionSelectFilter";
import type { AboutSection } from "./types";
import toast from "react-hot-toast";
import ConfirmDialog from "../../../shared/design-components/dialog/ConfirmDialog";

export default function About() {
  const navigate = useNavigate();
  const { selectedVersionId, setSelectedVersionId, versionOptions, versionsLoading } =
    useVersionFilter();

  const { data, isLoading, refetch } = useApiQuery("about")<{
    data: { items: AboutSection[] };
  }>({
    queryParams: selectedVersionId ? { versionId: selectedVersionId } : {},
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { execute: deleteAboutSection, isLoading: isDeleting } = useApiMutation(
    "aboutDetail",
  )<void, never>({
    method: "DELETE",
    onSuccess: () => refetch(),
    onError: (error) =>
      toast.error(error.message || "Failed to delete about section"),
  });

  const handleDelete = useCallback(
    (id: string) => {
      setDeleteId(id);
      setConfirmOpen(true);
    },
    [setDeleteId, setConfirmOpen],
  );

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAboutSection(undefined, { pathParams: { id: deleteId } });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns: ColumnDef<AboutSection>[] = useMemo(
    () => [
      {
        id: "sn",
        header: "S.N",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "image",
        header: "Image",
        cell: ({ row }) =>
          row.original.imageUrl ? (
            <img
              src={getImageUrl(row.original.imageUrl)}
              alt={row.original.title}
              className="h-10 w-10 rounded-md object-cover border border-border"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground">
              <ImageIcon size={14} />
            </div>
          ),
      },
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "content",
        header: "Content",
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-xs text-muted-foreground">
            {row.original.content}
          </span>
        ),
      },
      {
        header: "Version",
        accessorKey: "flagshipEventVersion.version_number",
        cell: ({ row }) => {
          const version = row.original.flagshipEventVersion;
          if (!version) return <span className="text-muted-foreground">—</span>;
          return (
            <div>
              {version.version_number}
              {version.is_current && (
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2" />
              )}
            </div>
          );
        },
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
            editHref={`edit/${row.original.id}`}
            onDelete={() => handleDelete(row.original.id)}
          />
        ),
      },
    ],
    [handleDelete],
  );

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={items}
        onRefetch={refetch}
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
              Add content
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
        title="Delete about section?"
        description="This will permanently delete this about section. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
