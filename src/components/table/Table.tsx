import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import EmptyCart from "../../assets/icons/EmptyCart";

interface TableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  onRefetch?: () => void;
}

export default function Table<TData, TValue>({
  columns,
  data,
  showSearch = true,
  searchPlaceholder = "Search...",
  onRefetch,
}: TableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState("");

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-start gap-4">
        {showSearch && data.length > 0 && (
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="bg-admin-primary border border-admin-primary text-white text-sm rounded-lg block w-full pl-10 p-2.5 outline-none transition-colors"
              placeholder={searchPlaceholder}
            />
          </div>
        )}
        {onRefetch && (
         <div>
           <button
            onClick={onRefetch}
            className="ml-auto p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all w-fit mr-auto"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
         </div>
        )}
      </div>
      <div className="w-full overflow-x-auto rounded-lg border border-gray-800 bg-admin-primary custom-scrollbar">
        <table className="w-full text-sm text-left align-middle min-w-[1200px]">
          <thead className="text-white bg-[#02111F] whitespace-nowrap">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-4 font-medium border-b border-gray-800"
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
          <tbody className="divide-y divide-gray-800">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4 whitespace-nowrap">
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
                  className="p-4 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center mx-auto w-fit gap-8 py-20">
                    <div className="opacity-20">
                      <EmptyCart />
                    </div>
                    <span className="text-sm font-semibold text-gray-400">
                      No results found.
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mt-4 px-2 pb-2">
        <div className="flex items-center gap-1">
          Showing <span className="text-white font-medium">{table.getRowModel().rows.length}</span> of <span className="text-white font-medium">{data.length}</span> results
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-2 rounded-lg border border-gray-800 hover:bg-gray-800 disabled:opacity-50 transition-all text-gray-400 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center gap-1">
            <span className="text-white font-medium px-3 py-1 bg-[#3571F0] rounded-md">
              {table.getState().pagination.pageIndex + 1}
            </span>
            <span className="px-2">of</span>
            <span className="text-white font-medium">
              {table.getPageCount() || 1}
            </span>
          </div>

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-2 rounded-lg border border-gray-800 hover:bg-gray-800 disabled:opacity-50 transition-all text-gray-400 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
