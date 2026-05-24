import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import TableRowActions from "../../components/table/TableRowActions";
import { useApiQuery } from "../../lib/use-api-query";
import { useApiMutation } from "../../lib/use-api-mutation";
import Table from "../../components/table/Table";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import type { FlagshipEventVersion } from "../../types/version";
import { EventVersionStatus } from "../../types/version";
import toast from "react-hot-toast";
import { statusColors } from "../../constants";

export default function Versions() {
  const { data, isLoading, refetch } = useApiQuery("versions")<{
    data: { items: FlagshipEventVersion[] };
  }>();

  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { execute: deleteVersion, isLoading: isDeleting } = useApiMutation(
    "versionDetail",
  )<void, never>({
    method: "DELETE",
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete version");
    },
  });

  // Opens the confirm dialog for a row and remembers which id to delete.
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
      await deleteVersion(undefined, { pathParams: { id: deleteId } });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns = useMemo<ColumnDef<FlagshipEventVersion>[]>(
    () => [
      {
        accessorKey: "version_name",
        header: "Version Name",
        cell: (info) => (
          <div className="flex items-center space-x-3">
            {info.row.original.logo ? (
              <img
                src={info.row.original.logo}
                alt={info.row.original.version_name}
                className="w-8 h-8 rounded object-contain bg-gray-800"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-gray-500">
                <FileText size={16} />
              </div>
            )}
            <span className="font-medium">
              {info.row.original.version_name}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "version_number",
        header: "Number",
        cell: (info) => `v${info.row.original.version_number}`,
      },
      {
        accessorKey: "slug",
        header: "Slug",
        cell: (info) => (
          <code className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400">
            {info.row.original.slug}
          </code>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => {
          const status = info.getValue() as EventVersionStatus;
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "is_current",
        header: "Current",
        cell: (info) =>
          info.row.original.is_current ? (
            <div className="flex items-center text-green-500">
              <CheckCircle2 size={16} className="mr-1" />
              <span className="text-xs font-medium">Yes</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500">No</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <TableRowActions
            editHref={`edit/${info.row.original.id}`}
            onDelete={() => handleDelete(info.row.original.id)}
          />
        ),
      },
    ],
    [handleDelete],
  );

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        isLoading={isLoading}
        data={data?.data?.items || []}
        searchPlaceholder="Search versions..."
        onRefetch={refetch}
        actionRight={
          <button
            onClick={() => navigate("add")}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add version
          </button>
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete version?"
        description="This will permanently delete this version. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
