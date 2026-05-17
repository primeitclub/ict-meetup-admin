import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { Plus, Filter, Search, Upload } from "lucide-react";
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

  const BASE_HOST = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api").replace("/api", "");

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BASE_HOST}${path}`;
  };

  const columns: ColumnDef<Event>[] = useMemo(() => [
    {
      id: "index",  
      header: () => (
        <div className="flex items-center gap-2">
          <span>ID</span>
          <Filter size={18} className="text-[#E6E6E6]" />
        </div>
      ),
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "imagePath",
      header: "Image",
      cell: ({ row }) => {
        const path = row.original.imagePath || (row.original as any).image;
        return (
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0B1730]">
            {path ? (
              <img src={getImageUrl(path)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-800/50">
                <Upload size={18} />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Title</span>
          <Filter size={18} className="text-[#E6E6E6]" />
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Description</span>
          <Filter size={18} className="text-[#E6E6E6]" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-gray-500" title={row.original.description}>
          {row.original.description || "-"}
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Date</span>
          <Filter size={18} className="text-[#E6E6E6]" />
        </div>
      ),
      cell: ({ row }) => {
        if (!row.original.date) return "-";
        const date = new Date(row.original.date);
        return date.toLocaleDateString();
      },
    },
    {
      id: "time",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Start & End Time</span>
          <Filter size={18} className="text-[#E6E6E6]" />
        </div>
      ),
      cell: ({ row }) => row.original.startTime && row.original.endTime 
        ? `${row.original.startTime} - ${row.original.endTime}`
        : "Register Now",
    },
    {
      id: "category",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Category</span>
          <Filter size={18} className="text-[#E6E6E6]" />
        </div>
      ),
      cell: ({ row }) => (row.original as any).category?.name || "-",
    },
    {
      accessorKey: "totalSeats",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Total Seat</span>
          <Filter size={18} className="text-[#E6E6E6]" />
        </div>
      ),
    },
    {
      accessorKey: "displayOrder",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Display order</span>
          <Filter size={18} className="text-[#E6E6E6]" />
        </div>
      ),
    },
    {
      accessorKey: "feeType",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Fee type</span>
          <Filter size={18} className="text-[#E6E6E6]" />
        </div>
      ),
      cell: ({ row }) => (
        <span className="capitalize">{row.original.feeType}</span>
      ),
    },
    {
      accessorKey: "registrationDeadline",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Registration Close Deadline</span>
          <Filter size={18} className="text-gray-500" />
        </div>
      ),
      cell: ({ row }) => {
        if (!row.original.registrationDeadline) return "-";
        return new Date(row.original.registrationDeadline).toLocaleDateString();
      },
    },
    {
      accessorKey: "speakerName",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Speaker</span>
          <Filter size={18} className="text-gray-500" />
        </div>
      ),
    },
    {
      id: "version",
      header: () => (
        <div className="flex items-center gap-2">
          <span>Flagship Version</span>
          <Filter size={18} className="text-gray-500" />
        </div>
      ),
      cell: ({ row }) => (row.original as any).flagshipEvent?.version_name || "-",
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <TableRowActions
          editHref={`edit/${row.original.id}`}
          onDelete={() => {
            if (window.confirm("Are you sure you want to delete this event?")) {
              deleteEvent(undefined, { 
                pathParams: { eventId: row.original.id },
                queryParams: { versionId: row.original.versionId }
              });
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
          
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0B1730] border border-gray-800 rounded-xl text-[#E6E6E6] hover:bg-[#152340] transition-colors font-medium text-sm">
            <Filter size={18} className="text-gray-400" />
            Filter
          </button>
          <button
            onClick={() => navigate("add")}
            className="flex items-center gap-2 px-6 py-2 bg-[#3571F0] hover:bg-[#3571F0]/90 text-white rounded-xl transition-colors font-medium text-sm"
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
       
        />
   

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-gray-800 border-t-admin-secondary rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

