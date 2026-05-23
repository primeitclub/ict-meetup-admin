import { useState, type ReactNode } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Search, RefreshCw, Inbox } from "lucide-react";
import { motion } from "framer-motion";

interface TableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showSearch?: boolean;
  isLoading?: boolean;
  searchPlaceholder?: string;
  onRefetch?: () => void;
  actionRight?: ReactNode;
}

export default function Table<TData, TValue>({
  columns,
  data,
  showSearch = true,
  searchPlaceholder = "Search...",
  onRefetch,
  isLoading,
  actionRight,
}: Readonly<TableProps<TData, TValue>>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [refreshSpins, setRefreshSpins] = useState(0);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {showSearch ? (
          <div className="flex items-center gap-2 w-full max-w-sm">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="bg-surface border border-border text-foreground text-sm rounded-lg block w-full pl-10 p-2.5 outline-none transition-colors focus:border-muted-foreground"
                placeholder={searchPlaceholder}
              />
            </div>
            {onRefetch && (
              <button
                onClick={() => {
                  setRefreshSpins((n) => n + 1);
                  onRefetch();
                }}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-lg transition-all"
                title="Refresh"
              >
                <motion.span
                  animate={{ rotate: refreshSpins * 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <RefreshCw size={16} />
                </motion.span>
              </button>
            )}
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">{actionRight}</div>
      </div>
      <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm text-left align-middle ">
          <thead className="text-foreground bg-surface-2 whitespace-nowrap">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-4 font-medium border-b border-border"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-foreground/5 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-4 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center mx-auto w-fit gap-4 py-20">
                    <div className="p-4 rounded-full bg-foreground/5 border border-foreground/10 text-muted-foreground">
                      <Inbox size={32} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                      No results found.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination UI */}
      {/* <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
        <div className="flex items-center space-x-2">
          <span>
            Page <span className="font-medium text-white">{table.getState().pagination.pageIndex + 1}</span> of{" "}
            <span className="font-medium text-white">{table.getPageCount() || 1}</span>
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="bg-admin-primary border border-gray-800 text-white rounded p-1 outline-none focus:border-admin-secondary transition-colors"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 rounded border border-gray-800 bg-admin-primary text-gray-300 hover:bg-[#1E1E1E] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 rounded border border-gray-800 bg-admin-primary text-gray-300 hover:bg-[#1E1E1E] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div> */}
    </div>
  );
}
