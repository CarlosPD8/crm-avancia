"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search, X } from "lucide-react";

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmada" },
  { value: "DONE", label: "Realizada" },
  { value: "CANCELLED", label: "Cancelada" },
];

const inputStyle: React.CSSProperties = {
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  color: "var(--text-1)",
  borderRadius: "0.5rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color 0.15s",
};

export function AppointmentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
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

  const clearFilters = () => router.push(pathname);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-3)" }} />
        <input
          type="text"
          placeholder="Buscar empresa, contacto..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleChange("q", e.target.value)}
          style={{ ...inputStyle, paddingLeft: "2.25rem", width: "14rem" }}
        />
      </div>

      <select
        value={searchParams.get("status") ?? ""}
        onChange={(e) => handleChange("status", e.target.value)}
        style={{ ...inputStyle, cursor: "pointer" }}
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <input
        type="date"
        value={searchParams.get("from") ?? ""}
        onChange={(e) => handleChange("from", e.target.value)}
        style={inputStyle}
        title="Desde"
      />
      <input
        type="date"
        value={searchParams.get("to") ?? ""}
        onChange={(e) => handleChange("to", e.target.value)}
        style={inputStyle}
        title="Hasta"
      />

      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70"
          style={{ color: "var(--text-3)" }}
        >
          <X className="h-3.5 w-3.5" />
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
