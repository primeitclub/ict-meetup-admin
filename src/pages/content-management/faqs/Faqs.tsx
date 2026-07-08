import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../../components/table/Table";
import TableRowActions from "../../../components/table/TableRowActions";
import { useApiQuery } from "../../../lib";
import { useApiMutation } from "../../../lib/use-api-mutation";
import { useVersionFilter } from "../../../lib/hooks/use-version-filter";
import VersionSelectFilter from "../../../components/VersionSelectFilter";
import ConfirmDialog from "../../../shared/design-components/dialog/ConfirmDialog";
import type { FaqSyncPayload, GroupedFaqVersion } from "../../../types/faq";

const statusClasses: Record<string, string> = {
  draft: "bg-amber-500/15 text-amber-600",
  published: "bg-emerald-500/15 text-emerald-600",
  archived: "bg-muted text-muted-foreground",
};

export default function Faqs() {
  const navigate = useNavigate();
  const { selectedVersionId, setSelectedVersionId, versionOptions, versionsLoading } =
    useVersionFilter();

  // FAQs are grouped per version — each row is a version with its FAQ array.
  // Only versions that already have ≥1 FAQ appear here.
  const { data, isLoading, refetch } = useApiQuery("faqsGrouped")<{
    data: { items: GroupedFaqVersion[] };
  }>();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteVersionId, setDeleteVersionId] = useState<string | null>(null);

  // Delete = clear all FAQs for a version via the sync endpoint: PUT an empty
  // array and `syncByVersion` removes the omitted (i.e. all) FAQs in one go.
  const { execute: clearVersionFaqs, isLoading: isDeleting } = useApiMutation(
    "faqs",
  )<{ data: { items: unknown[] } }, FaqSyncPayload>({
    method: "PUT",
    onSuccess: () => refetch(),
    onError: (error) => toast.error(error.message || "Failed to delete FAQs"),
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
      await clearVersionFaqs({ versionId: deleteVersionId, faqs: [] });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns: ColumnDef<GroupedFaqVersion>[] = useMemo(
    () => [
      {
        id: "sn",
        header: "S.N",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "versionName",
        header: "Version",
      },
      {
        accessorKey: "versionNumber",
        header: "Version No.",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                statusClasses[status] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        id: "faqCount",
        header: "FAQs",
        cell: ({ row }) => row.original.faqs.length,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TableRowActions
            editHref={`edit/${row.original.versionId}`}
            onDelete={() => handleDelete(row.original.versionId)}
          />
        ),
      },
    ],
    [handleDelete],
  );

  const allItems = data?.data?.items ?? [];
  const items = selectedVersionId
    ? allItems.filter((i) => i.versionId === selectedVersionId)
    : allItems;

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={items}
        onRefetch={refetch}
        searchPlaceholder="Search versions..."
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
              Add FAQ
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
        title="Delete all FAQs for this version?"
        description="This will permanently delete every FAQ in this version. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
