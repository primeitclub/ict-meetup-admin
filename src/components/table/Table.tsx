import { useState, type ReactNode } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { Search, RefreshCw, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Tooltip from "../../shared/design-components/tooltip/Tooltip";
import ScrollArea from "../../shared/design-components/scroll-area/ScrollArea";

/** Server-side pagination state, driven by the API's `meta` envelope. */
export interface TablePaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
}

interface TableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showSearch?: boolean;
  isLoading?: boolean;
  searchPlaceholder?: string;
  onRefetch?: () => void;
  actionRight?: ReactNode;
  /** When provided, renders page controls below the table instead of showing only the first page of `data`. */
  pagination?: TablePaginationProps;
  /**
   * Keep every cell on one line and let the table grow past its container
   * width, so the horizontal scrollbar actually activates instead of
   * wrapping cell text to cram into 100% width. Opt-in only — most tables
   * have few enough columns that wrapping looks fine, and some columns
   * (long descriptions) rely on wrapping. Turn on for wide, many-column
   * tables like Registrations.
   */
  nowrap?: boolean;
}

export default function Table<TData, TValue>({
  columns,
  data,
  showSearch = true,
  searchPlaceholder = "Search...",
  onRefetch,
  isLoading,
  actionRight,
  pagination,
  nowrap = false,
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
              <Tooltip content="Refresh">
                <button
                  onClick={() => {
                    setRefreshSpins((n) => n + 1);
                    onRefetch();
                  }}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-lg transition-all"
                >
                  <motion.span
                    animate={{ rotate: refreshSpins * 360 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="inline-flex"
                  >
                    <RefreshCw size={16} />
                  </motion.span>
                </button>
              </Tooltip>
            )}
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">{actionRight}</div>
      </div>
      <ScrollArea
        orientation="horizontal"
        type={nowrap ? "always" : "hover"}
        className="w-full rounded-lg border border-border bg-surface"
      >
        <table
          className={`${nowrap ? "min-w-full" : "w-full"} text-sm text-left align-middle`}
        >
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
          <tbody
            className={`divide-y divide-border ${nowrap ? "whitespace-nowrap" : ""}`}
          >
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
      </ScrollArea>

      {pagination && Number(pagination.total) > 0 && (() => {
        const currentPage = Number(pagination.page) || 1;
        const currentLimit = Number(pagination.limit) || 10;
        const totalItems = Number(pagination.total) || 0;
        const totalPages = Number(pagination.totalPages) || 1;

        return (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * currentLimit + 1}
                </span>
                {"–"}
                <span className="font-medium text-foreground">
                  {Math.min(currentPage * currentLimit, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {totalItems}
                </span>
              </span>
              {pagination.onLimitChange && (
                <select
                  value={currentLimit}
                  onChange={(e) =>
                    pagination.onLimitChange?.(Number(e.target.value))
                  }
                  className="bg-surface border border-border text-foreground rounded-lg p-1.5 outline-none focus:border-muted-foreground transition-colors"
                >
                  {(pagination.pageSizeOptions ?? [10, 20, 50, 100]).map(
                    (size) => (
                      <option key={size} value={size}>
                        Show {size}
                      </option>
                    ),
                  )}
                </select>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span>
                Page{" "}
                <span className="font-medium text-foreground">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {Math.max(totalPages, 1)}
                </span>
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => pagination.onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => pagination.onPageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg border border-border bg-surface text-foreground hover:bg-surface-2 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
