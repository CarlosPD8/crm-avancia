"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";
import { LoadingSpinner } from "./LoadingSpinner";
import type { LucideIcon } from "lucide-react";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  actions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  keyField?: string;
  className?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyIcon,
  emptyTitle = "Sin resultados",
  emptyDescription,
  actions,
  onRowClick,
  keyField = "id",
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getField = (row: T, key: string): unknown => {
    return (row as Record<string, unknown>)[key];
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const av = getField(a, sortKey);
    const bv = getField(b, sortKey);
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <div className={cn("bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap",
                    col.sortable && "cursor-pointer select-none hover:text-slate-700",
                    col.headerClassName
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span className="text-slate-300">
                        {sortKey === col.key ? (
                          sortDir === "asc" ? (
                            <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-12">
                  <LoadingSpinner className="py-4" />
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)}>
                  <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={String(getField(row, keyField) ?? i)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors duration-100",
                    onRowClick ? "cursor-pointer hover:bg-slate-50/80" : "hover:bg-slate-50/40"
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3.5 text-slate-700 whitespace-nowrap", col.className)}
                    >
                      {col.render
                        ? col.render(getField(row, col.key), row)
                        : String(getField(row, col.key) ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3.5 text-right">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-end gap-1"
                      >
                        {actions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && sorted.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {sorted.length} {sorted.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>
      )}
    </div>
  );
}
