import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Plus, Tags, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import type { Sponsor } from "../../types/sponsor";

export default function AllSponsors() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useApiQuery("sponsors")<{
    data: { items: Sponsor[] };
  }>({
    queryParams: { limit: 100 },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  // Capture the version too — the delete sends it for the audit log.
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    versionId: string;
  } | null>(null);

  const { execute: deleteSponsor, isLoading: isDeleting } = useApiMutation(
    "sponsorDetail",
  )<void, never>({
    method: "DELETE",
    onSuccess: () => refetch(),
    onError: (error) =>
      toast.error(error.message || "Failed to delete sponsor"),
  });

  const handleDelete = useCallback(
    (id: string, versionId: string) => {
      setDeleteTarget({ id, versionId });
      setConfirmOpen(true);
    },
    [setDeleteTarget, setConfirmOpen],
  );

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      // versionId is for the audit log; deletion is by id.
      await deleteSponsor(undefined, {
        pathParams: { sponsorId: deleteTarget.id },
        queryParams: { versionId: deleteTarget.versionId },
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns: ColumnDef<Sponsor>[] = useMemo(
    () => [
      {
        id: "sn",
        header: "S.N",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "image",
        header: "Logo",
        cell: ({ row }) =>
          row.original.imageUrl ? (
            <img
              src={row.original.imageUrl}
              alt={row.original.name}
              className="h-10 w-10 rounded-md object-contain border border-border bg-white"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface-2 text-muted-foreground">
              <ImageIcon size={14} />
            </div>
          ),
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        id: "category",
        header: "Category",
        cell: ({ row }) => row.original.category?.name ?? "—",
      },
      {
        id: "version",
        header: "Version",
        cell: ({ row }) => row.original.flagshipEvent?.version_name ?? "—",
      },
      {
        accessorKey: "displayOrder",
        header: "Order",
      },
      {
        id: "link",
        header: "Link",
        cell: ({ row }) =>
          row.original.link ? (
            <a
              href={row.original.link}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              Visit
            </a>
          ) : (
            "—"
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TableRowActions
            editHref={`edit/${row.original.id}`}
            onDelete={() =>
              handleDelete(row.original.id, row.original.versionId)
            }
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
        searchPlaceholder="Search sponsors..."
        actionRight={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/sponsors/categories")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
            >
              <Tags size={16} />
              Categories
            </button>
            <button
              onClick={() => navigate("add")}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add sponsor
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
        title="Delete sponsor?"
        description="This will permanently delete this sponsor and its logo. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
