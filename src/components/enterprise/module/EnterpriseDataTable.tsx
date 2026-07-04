"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpDown,
  Settings2,
} from "lucide-react";

export interface DataTableColumn<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  width?: string;
  hideable?: boolean;
  className?: string;
}

export interface BulkAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedRows: T[]) => void;
  variant?: "primary" | "outline" | "destructive";
}

export interface SavedView {
  id: string;
  label: string;
}

interface EnterpriseDataTableProps<T extends { id: string }> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  bulkActions?: BulkAction<T>[];
  onExport?: () => void;
  savedViews?: SavedView[];
  activeView?: string;
  onViewChange?: (viewId: string) => void;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onSort?: (columnId: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: T) => void;
  renderExtra?: (row: T) => ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function EnterpriseDataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  searchValue: _searchValue,
  onSearchChange: _onSearchChange,
  searchPlaceholder: _searchPlaceholder,
  bulkActions,
  onExport,
  savedViews,
  activeView,
  onViewChange,
  pageSize = 10,
  currentPage = 1,
  totalPages: propTotalPages,
  totalItems: propTotalItems,
  onPageChange,
  onSort,
  onRowClick,
  renderExtra,
  emptyMessage = "No data found.",
  className,
}: EnterpriseDataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((r) => r.id)));
    }
  };

  const handleSelectRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRows(next);
  };

  const handleSort = (columnId: string) => {
    const newDir =
      sortCol === columnId && sortDir === "asc" ? "desc" : "asc";
    setSortCol(columnId);
    setSortDir(newDir);
    onSort?.(columnId, newDir);
  };

  const visibleColumns = columns.filter((c) => !hiddenColumns.has(c.id));
  const totalPages = propTotalPages ?? Math.ceil(data.length / pageSize);
  const totalItems = propTotalItems ?? data.length;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top toolbar: bulk actions, views, export */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Selected count & bulk actions */}
          {selectedRows.size > 0 && bulkActions && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {selectedRows.size} selected
              </span>
              {bulkActions.map((action, i) => (
                <Button
                  key={i}
                  size="xs"
                  variant={action.variant ?? "outline"}
                  onClick={() => {
                    const selected = data.filter((r) =>
                      selectedRows.has(r.id)
                    );
                    action.onClick(selected);
                  }}
                  className="h-7 text-xs"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Saved views */}
          {savedViews && savedViews.length > 0 && (
            <select
              value={activeView ?? ""}
              onChange={(e) => onViewChange?.(e.target.value)}
              className="rounded-xl border border-slate-700/50 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300 h-8 outline-none focus:border-cyan-500/50"
            >
              <option value="" disabled>
                Saved Views
              </option>
              {savedViews.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          )}

          {/* Column visibility */}
          {columns.some((c) => c.hideable !== false) && (
            <div className="relative">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className="h-8 gap-1 text-slate-400 hover:text-slate-200"
              >
                <Settings2 size={12} />
                Columns
              </Button>
              {showColumnMenu && (
                <div className="absolute right-0 top-full mt-1 z-20 rounded-xl border border-slate-700/50 bg-slate-900 p-2 shadow-xl min-w-[160px]">
                  {columns
                    .filter((c) => c.hideable !== false)
                    .map((col) => (
                      <label
                        key={col.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 cursor-pointer text-xs text-slate-300"
                      >
                        <input
                          type="checkbox"
                          checked={!hiddenColumns.has(col.id)}
                          onChange={() => {
                            const next = new Set(hiddenColumns);
                            if (next.has(col.id)) {
                              next.delete(col.id);
                            } else {
                              next.add(col.id);
                            }
                            setHiddenColumns(next);
                          }}
                          className="accent-cyan-500"
                        />
                        {col.header}
                      </label>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Export */}
          {onExport && (
            <Button
              variant="outline"
              size="xs"
              onClick={onExport}
              className="h-8 gap-1.5 border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800 text-xs"
            >
              <Download size={12} />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-800/60">
              {/* Checkbox column for bulk actions */}
              {bulkActions && bulkActions.length > 0 && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      data.length > 0 && selectedRows.size === data.length
                    }
                    onChange={handleSelectAll}
                    className="accent-cyan-500 rounded"
                  />
                </th>
              )}
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500",
                    col.sortable && "cursor-pointer select-none hover:text-slate-300",
                    col.className
                  )}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <ArrowUpDown
                        size={11}
                        className={cn(
                          "text-slate-600",
                          sortCol === col.id && "text-cyan-400"
                        )}
                      />
                    )}
                  </div>
                </th>
              ))}
              {renderExtra && <th className="w-10 px-2 py-3" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton
                columns={visibleColumns.length + (bulkActions ? 1 : 0)}
                rows={5}
              />
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    visibleColumns.length +
                    (bulkActions && bulkActions.length > 0 ? 1 : 0) +
                    (renderExtra ? 1 : 0)
                  }
                  className="px-4 py-16 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => {
                const isSelected = selectedRows.has(row.id);
                return (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-slate-800/40 last:border-0 transition-colors",
                      onRowClick && "cursor-pointer",
                      isSelected
                        ? "bg-cyan-500/5"
                        : "hover:bg-slate-800/30"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {bulkActions && bulkActions.length > 0 && (
                      <td className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(row.id);
                          }}
                          className="accent-cyan-500 rounded"
                        />
                      </td>
                    )}
                    {visibleColumns.map((col) => (
                      <td
                        key={col.id}
                        className={cn(
                          "px-4 py-3 text-sm text-slate-300",
                          col.className
                        )}
                      >
                        {typeof col.accessor === "function"
                          ? col.accessor(row)
                          : (row[col.accessor] as ReactNode)}
                      </td>
                    ))}
                    {renderExtra && (
                      <td className="w-10 px-2 py-3">
                        {renderExtra(row)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {startItem}-{endItem} of {totalItems}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"
            >
              <ChevronLeft size={16} />
            </button>
                    {Array.from({ length: totalPages }, (_, idx) => idx + 1)
              .slice(Math.max(0, currentPage - 3), currentPage + 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                    p === currentPage
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:bg-slate-800 border border-transparent"
                  )}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() =>
                onPageChange?.(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TableSkeleton({
  columns,
  rows,
}: {
  columns: number;
  rows: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-slate-800/40 last:border-0">
          {Array.from({ length: columns }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 rounded bg-slate-700/50 animate-pulse w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}