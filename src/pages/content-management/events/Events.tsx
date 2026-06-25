import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Plus, ImageIcon, Tags } from "lucide-react";
import Table from "../../../components/table/Table";
import TableRowActions from "../../../components/table/TableRowActions";
import { useApiQuery } from "../../../lib";
import { useApiMutation } from "../../../lib/use-api-mutation";
import type { EventItem, EventStatus } from "./types";
import toast from "react-hot-toast";
import ConfirmDialog from "../../../shared/design-components/dialog/ConfirmDialog";

const statusStyles: Record<EventStatus, string> = {
  draft: "bg-blue-500/20 text-blue-400",
  published: "bg-green-500/20 text-green-400",
  archived: "bg-gray-500/20 text-gray-400",
};

export default function Events() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useApiQuery("events")<{
    data: { items: EventItem[] };
  }>();

  const [confirmOpen, setConfirmOpen] = useState(false);
  // Event delete is version-scoped — the backend needs both id and versionId.
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    versionId: string;
  } | null>(null);

  const { execute: deleteEvent, isLoading: isDeleting } = useApiMutation(
    "eventDetail",
  )<void, never>({
    method: "DELETE",
    invalidateRoutes: ["events"],
    onSuccess: () => refetch(),
    onError: (error) => toast.error(error.message || "Failed to delete event"),
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
      await deleteEvent(undefined, {
        pathParams: { eventId: deleteTarget.id },
        queryParams: { versionId: deleteTarget.versionId },
      });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns: ColumnDef<EventItem>[] = useMemo(
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
              src={row.original.imageUrl}
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
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) =>
          row.original.date
            ? new Date(row.original.date).toLocaleDateString()
            : "—",
      },
      {
        accessorKey: "location",
        header: "Location",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                statusStyles[status] ?? "bg-gray-500/20 text-gray-400"
              }`}
            >
              {status ? status.charAt(0) + status.slice(1).toLowerCase() : "—"}
            </span>
          );
        },
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
        searchPlaceholder="Search events..."
        actionRight={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("categories")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
            >
              <Tags size={16} />
              View categories
            </button>
            <button
              onClick={() => navigate("add")}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add event
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
        title="Delete event?"
        description="This will permanently delete this event. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
