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
  onRowDoubleClick?: (row: T) => void;
  keyField?: string;
  className?: string;
}

type SortDir = "asc" | "desc";

export function DataTable<T>({
  columns, data, isLoading,
  emptyIcon, emptyTitle = "Sin resultados", emptyDescription,
  actions, onRowClick, onRowDoubleClick, keyField = "id", className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const getField = (row: T, key: string): unknown => (row as Record<string, unknown>)[key];

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const av = getField(a, sortKey), bv = getField(b, sortKey);
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const isInteractive = !!(onRowClick || onRowDoubleClick);

  return (
    <div
      className={cn("rounded-2xl overflow-hidden animate-fade-in", className)}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--bg-elevated)" }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest whitespace-nowrap select-none",
                    col.sortable && "cursor-pointer",
                    col.headerClassName,
                  )}
                  style={{ color: "var(--text-3)" }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      <span style={{ opacity: sortKey === col.key ? 1 : 0.4 }}>
                        {sortKey === col.key
                          ? sortDir === "asc"
                            ? <ChevronUp className="h-3 w-3" style={{ color: "var(--accent)" }} />
                            : <ChevronDown className="h-3 w-3" style={{ color: "var(--accent)" }} />
                          : <ChevronsUpDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="py-16">
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
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                  className={cn("transition-all duration-100", isInteractive && "cursor-pointer")}
                  style={{ borderTop: "1px solid var(--border)" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "var(--bg-elevated)";
                    if (isInteractive) el.style.paddingLeft = "2px";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.paddingLeft = "0";
                  }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-5 py-3.5 whitespace-nowrap", col.className)} style={{ color: "var(--text-2)" }}>
                      {col.render ? col.render(getField(row, col.key), row) : String(getField(row, col.key) ?? "—")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-5 py-3.5 text-right">
                      <div onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()} className="flex items-center justify-end gap-1.5">
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
        <div
          className="px-5 py-2.5 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg-elevated)" }}
        >
          <p className="text-[11px] font-medium" style={{ color: "var(--text-3)" }}>
            {sorted.length} {sorted.length === 1 ? "resultado" : "resultados"}
          </p>
        </div>
      )}
    </div>
  );
}
