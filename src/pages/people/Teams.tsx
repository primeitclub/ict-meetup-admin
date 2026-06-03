import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Plus, Layers, BadgeCheck } from "lucide-react";
import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import useGetVersionOptions from "../../lib/hooks/use-get-version-options";
import type { TeamMember, TeamCategory, Designation } from "../../types/team";
import toast from "react-hot-toast";
import ConfirmDialog from "../../shared/design-components/dialog/ConfirmDialog";

export default function Teams() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useApiQuery("teams")<{
    data: { items: TeamMember[] };
  }>();

  // Lookup data so we can label ids even when the list omits nested relations.
  const { data: categoriesData } = useApiQuery("teamCategories")<{
    data: { items: TeamCategory[] };
  }>();
  const { data: designationsData } = useApiQuery("designations")<{
    data: { items: Designation[] };
  }>();
  const { options: versionOptions } = useGetVersionOptions({ status: null });

  const categoryNameById = useMemo(
    () =>
      new Map(
        (categoriesData?.data?.items ?? []).map((c) => [
          c.id,
          c.displayName || c.name,
        ]),
      ),
    [categoriesData],
  );
  const designationNameById = useMemo(
    () =>
      new Map(
        (designationsData?.data?.items ?? []).map((d) => [d.id, d.name]),
      ),
    [designationsData],
  );
  const versionNameById = useMemo(
    () => new Map(versionOptions.map((v) => [v.value, v.label])),
    [versionOptions],
  );

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { execute: deleteTeam, isLoading: isDeleting } = useApiMutation(
    "teamDetail",
  )<void, never>({
    method: "DELETE",
    onSuccess: () => refetch(),
    onError: (error) =>
      toast.error(error.message || "Failed to delete team member"),
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
      await deleteTeam(undefined, { pathParams: { teamId: deleteId } });
    } finally {
      setConfirmOpen(false);
    }
  };

  const columns: ColumnDef<TeamMember>[] = useMemo(
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
        id: "category",
        header: "Category",
        cell: ({ row }) =>
          row.original.category?.displayName ||
          row.original.category?.name ||
          categoryNameById.get(row.original.categoryId) ||
          "—",
      },
      {
        id: "designation",
        header: "Designation",
        cell: ({ row }) =>
          row.original.designation?.name ||
          designationNameById.get(row.original.designationId) ||
          "—",
      },
      {
        id: "version",
        header: "Version",
        cell: ({ row }) =>
          row.original.flagshipEventVersion?.version_name ||
          versionNameById.get(row.original.versionId) ||
          "—",
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
    [handleDelete, categoryNameById, designationNameById, versionNameById],
  );

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={items}
        onRefetch={refetch}
        searchPlaceholder="Search team members..."
        actionRight={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("categories")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
            >
              <Layers size={16} />
              Categories
            </button>
            <button
              onClick={() => navigate("designations")}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-2 transition-colors"
            >
              <BadgeCheck size={16} />
              Designations
            </button>
            <button
              onClick={() => navigate("add")}
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add team member
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
        title="Delete team member?"
        description="This will permanently delete this team member. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
