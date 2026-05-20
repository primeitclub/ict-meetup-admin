import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import type { faqSection } from "../../types/faq";
import toast from "react-hot-toast";

export default function Faqs() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useApiQuery("faqs")<{
    data: { items: faqSection[] };
  }>();

  const { execute: deleteAboutSection } = useApiMutation("faqDetail")<
    void,
    never
  >({
    method: "DELETE",
    onSuccess: () => refetch(),
    onError: (error) =>
      toast.error(error.message || "Failed to delete hero section"),
  });

  const columns: ColumnDef<faqSection>[] = useMemo(
    () => [
      {
        id: "sn",
        header: "S.N",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "description",
        header: "Description",
      },

      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TableRowActions
            editHref={`edit/${row.original.id}`}
            onDelete={() => {
              if (
                window.confirm(
                  "Are you sure you want to delete this abour section?",
                )
              ) {
                deleteAboutSection(undefined, {
                  pathParams: { id: row.original.id },
                });
              }
            }}
          />
        ),
      },
    ],
    [deleteAboutSection],
  );

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">FAQ Content</h2>
          <p className="text-gray-400 text-sm mt-1">Manage the FAQs.</p>
        </div>
        <button
          onClick={() => navigate("add")}
          className="bg-admin-secondary hover:bg-admin-secondary/80 text-white px-4 py-2 rounded-md transition-colors font-medium"
        >
          Add New Content
        </button>
      </div>

      <Table columns={columns} data={items} onRefetch={refetch} />
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-gray-800 border-t-admin-secondary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
