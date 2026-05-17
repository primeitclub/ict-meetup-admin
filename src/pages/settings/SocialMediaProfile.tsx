import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Table from "../../components/table/Table";
import TableRowActions from "../../components/table/TableRowActions";
import {
  useSocialMediaList,
  useSocialMediaMutations,
} from "../../lib/hooks/use-settings-data";
import type { SocialMediaItem } from "../../types/settings";

export default function SocialMediaProfile() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useSocialMediaList();
  const { remove } = useSocialMediaMutations();

  const columns = useMemo<ColumnDef<SocialMediaItem>[]>(
    () => [
      { accessorKey: "platform", header: "Platform" },
      {
        accessorKey: "url",
        header: "Profile URL",
        cell: (info) => (
          <a
            href={info.row.original.url}
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            {info.row.original.url}
          </a>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <TableRowActions
            editHref={`edit/${info.row.original.id}`}
            onDelete={() => {
              if (window.confirm("Are you sure you want to delete this profile?")) {
                remove.mutate(info.row.original.id, {
                  onSuccess: () => {
                    toast.success("Profile deleted successfully");
                    refetch();
                  },
                  onError: (error) =>
                    toast.error(error.message || "Failed to delete profile"),
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
          <h2 className="text-2xl font-bold">Social Media Profiles</h2>
          <p className="text-gray-400 text-sm mt-1">Manage social media profile links.</p>
        </div>
        <button
          onClick={() => navigate("add")}
          className="bg-admin-secondary hover:bg-admin-secondary/80 text-white px-4 py-2 rounded-md transition-colors font-medium"
        >
          Add New Link
        </button>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <Table
          columns={columns}
          data={data?.items ?? []}
          searchPlaceholder="Search profiles..."
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
