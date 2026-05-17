import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import { usePaymentsList, usePaymentMutations } from "../../lib/hooks/use-settings-data";
import type { PaymentQrItem } from "../../types/settings";

export default function PaymentSetup() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = usePaymentsList();
  const { remove } = usePaymentMutations();

  const columns = useMemo<ColumnDef<PaymentQrItem>[]>(
    () => [
      {
        accessorKey: "qr",
        header: "QR Image",
        cell: (info) => (
          <img
            src={info.row.original.qr}
            alt="QR"
            className="w-16 h-16 object-cover rounded-md border border-gray-700"
          />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <TableRowActions
            editHref={`edit/${info.row.original.id}`}
            onDelete={() => {
              if (window.confirm("Are you sure you want to delete this QR?")) {
                remove.mutate(info.row.original.id, {
                  onSuccess: () => {
                    toast.success("QR deleted successfully");
                    refetch();
                  },
                  onError: (error) => toast.error(error.message || "Failed to delete QR"),
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
          <h2 className="text-2xl font-bold">Payment Setup</h2>
          <p className="text-gray-400 text-sm mt-1">Manage payment QR setup.</p>
        </div>
        <button
          onClick={() => navigate("add")}
          className="bg-admin-secondary hover:bg-admin-secondary/80 text-white px-4 py-2 rounded-md transition-colors font-medium"
        >
          Add QR
        </button>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <Table
          columns={columns}
          data={data?.items ?? []}
          searchPlaceholder="Search QR..."
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
