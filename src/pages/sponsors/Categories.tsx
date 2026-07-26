import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Plus, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import { usePagination } from "../../lib/hooks/use-pagination";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";
import type { SponsorCategory } from "../../types/sponsor";
import type { PaginationMeta } from "../../types/pagination";

export default function Categories() {
  const navigate = useNavigate();
  const { page, limit, setPage, setLimit } = usePagination();

  const { data, isLoading, refetch } = useApiQuery("sponsorCategories")<{
    data: { items: SponsorCategory[]; meta: PaginationMeta };
  }>({
    queryParams: { page, limit },
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { execute: deleteCategory, isLoading: isDeleting } = useApiMutation(
    "sponsorCategoryDetail",
  )<void, never>({
    method: "DELETE",
    onSuccess: () => refetch(),
    // 409 when the category is still assigned to sponsors — surface the message.
    onError: (error) =>
      toast.error(error.message || "Failed to delete category"),
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
      await deleteCategory(undefined, { pathParams: { categoryId: deleteId } });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns: ColumnDef<SponsorCategory>[] = useMemo(
    () => [
      {
        id: "sn",
        header: "S.N",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "displayName",
        header: "Display Name",
      },
      {
        accessorKey: "displayOrder",
        header: "Order",
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
  const meta = data?.data?.meta;

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={items}
        onRefetch={refetch}
        searchPlaceholder="Search categories..."
        pagination={
          meta && {
            page: meta.page,
            limit: meta.limit,
            total: meta.total,
            totalPages: meta.totalPages,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }
        }
        actionRight={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/sponsors/all-sponsors")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
            >
              <Building2 size={16} />
              View sponsors
            </button>
            <button
              onClick={() => navigate("add")}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add category
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
        title="Delete category?"
        description="This will permanently delete this sponsor category. It can't be deleted while sponsors are still assigned to it."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
