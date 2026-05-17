import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import { useContactsList, useContactMutations } from "../../lib/hooks/use-settings-data";
import type { ContactItem } from "../../types/settings";

export default function ContactManagement() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useContactsList();
  const { remove } = useContactMutations();

  const columns = useMemo<ColumnDef<ContactItem>[]>(
    () => [
      { accessorKey: "name", header: "Team Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phone", header: "Phone" },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <TableRowActions
            editHref={`edit/${info.row.original.id}`}
            onDelete={() => {
              if (window.confirm("Are you sure you want to delete this contact?")) {
remove.mutate(info.row.original.id, {
                  onSuccess: () => {
                    toast.success("Contact deleted successfully");
                    refetch();
                  },
                  onError: (error) =>
                    toast.error(error instanceof Error ? error.message : "Failed to delete contact"),
                });
              }
            }}
          />
        ),
      },
    ],
    [remove, refetch],
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Contact Management</h2>
          <p className="text-gray-400 text-sm mt-1">Manage contact information.</p>
        </div>
        <button
          onClick={() => navigate("add")}
          className="bg-admin-secondary hover:bg-admin-secondary/80 text-white px-4 py-2 rounded-md transition-colors font-medium"
        >
          Add Contact
        </button>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <Table
          columns={columns}
          data={data?.items ?? []}
          searchPlaceholder="Search contacts..."
          onRefetch={refetch}
        />
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}


