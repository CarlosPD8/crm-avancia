"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "DONE", label: "Realizada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export function AppointmentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return params.toString();
    },
    [searchParams]
  );

  const handleChange = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString({ [key]: value })}`);
  };

  const hasFilters =
    searchParams.has("status") ||
    searchParams.has("from") ||
    searchParams.has("to") ||
    searchParams.has("q");

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar empresa, contacto..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleChange("q", e.target.value)}
          className={cn(
            "pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
            "w-56 transition-all duration-150"
          )}
        />
      </div>

      {/* Status filter */}
      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => handleChange("status", e.target.value)}
        className={cn(
          "px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
          "cursor-pointer"
        )}
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Date range */}
      <input
        type="date"
        value={searchParams.get("from") ?? ""}
        onChange={(e) => handleChange("from", e.target.value)}
        className={cn(
          "px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        )}
        placeholder="Desde"
        title="Desde"
      />
      <input
        type="date"
        value={searchParams.get("to") ?? ""}
        onChange={(e) => handleChange("to", e.target.value)}
        className={cn(
          "px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        )}
        placeholder="Hasta"
        title="Hasta"
      />

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
