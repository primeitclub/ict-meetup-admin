import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Plus, Filter } from "lucide-react";
import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import { useApiQuery } from "../../lib";
import { useApiMutation } from "../../lib/use-api-mutation";
import type { Event } from "../../types/event";
import toast from "react-hot-toast";

export default function Events() {
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useApiQuery("events")<{ data: { items: Event[] } }>();

  const { execute: deleteEvent } = useApiMutation("eventDetail")<void, never>({
    method: "DELETE",
    onSuccess: () => {
      toast.success("Event deleted successfully");
      refetch();
    },
    onError: (error) => toast.error(error.message || "Failed to delete event"),
  });

  const columns: ColumnDef<Event>[] = useMemo(() => [
    {
      accessorKey: "displayOrder",
      header: "ID",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "speakerName",
      header: "Speaker",
    },
    {
      accessorKey: "eventDate",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.original.eventDate);
        return date.toLocaleDateString();
      },
    },
    {
      id: "time",
      header: "Start & End Time",
      cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`,
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "totalSeats",
      header: "Total Seat",
    },
    {
      accessorKey: "displayOrder",
      header: "Display order",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <TableRowActions
          editHref={`edit/${row.original.id}`}
          onDelete={() => {
            if (window.confirm("Are you sure you want to delete this event?")) {
              deleteEvent(undefined, { pathParams: { eventId: row.original.id } });
            }
          }}
        />
      ),
    },
  ], [deleteEvent]);


  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          {/* Table handles the search bar internally if showSearch is true, 
              but the screenshot has buttons next to it. 
              Let's see if we can customize the layout. */}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0B1730] border border-gray-800 rounded-xl text-[#E6E6E6] hover:bg-[#152340] transition-colors font-medium">
            <Filter size={18} className="text-gray-400" />
            Filter
          </button>
          <button
            onClick={() => navigate("add")}
            className="flex items-center gap-2 px-4 py-2 bg-[#3571F0] hover:bg-[#3571F0]/90 text-white rounded-xl transition-colors font-medium"
          >
            <Plus size={20} />
            Add events
          </button>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={items} 
        onRefetch={refetch}
        searchPlaceholder="Search contents"
      />

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-gray-800 border-t-admin-secondary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

