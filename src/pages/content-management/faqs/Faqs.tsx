import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import Table from "../../../components/table/Table";
import TableRowActions from "../../../components/table/TableRowActions";
import { useApiQuery } from "../../../lib";
import type { GroupedFaqVersion } from "../../../types/faq";

const statusClasses: Record<string, string> = {
  draft: "bg-amber-500/15 text-amber-600",
  published: "bg-emerald-500/15 text-emerald-600",
  archived: "bg-muted text-muted-foreground",
};

export default function Faqs() {
  const navigate = useNavigate();

  // FAQs are grouped per version — each row is a version with its FAQ array.
  // Only versions that already have ≥1 FAQ appear here.
  const { data, isLoading, refetch } = useApiQuery("faqsGrouped")<{
    data: { items: GroupedFaqVersion[] };
  }>();

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
          <TableRowActions editHref={`edit/${row.original.versionId}`} />
        ),
      },
    ],
    [],
  );

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <Table
        columns={columns}
        data={items}
        onRefetch={refetch}
        searchPlaceholder="Search versions..."
        actionRight={
          <button
            onClick={() => navigate("add")}
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Add FAQ
          </button>
        }
      />
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
