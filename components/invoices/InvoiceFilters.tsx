"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const statusOptions = [
  { value: "", label: "Todos los estados" },
  { value: "DRAFT", label: "Borrador" },
  { value: "SENT", label: "Enviada" },
  { value: "PARTIAL", label: "Parcial" },
  { value: "PAID", label: "Pagada" },
  { value: "OVERDUE", label: "Vencida" },
  { value: "CANCELLED", label: "Cancelada" },
];

export function InvoiceFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const push = useCallback((key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value); else sp.delete(key);
    router.push(`/invoices?${sp.toString()}`);
  }, [router, params]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Buscar empresa, cliente, número..."
        defaultValue={params.get("q") ?? ""}
        onChange={(e) => push("q", e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        value={params.get("status") ?? ""}
        onChange={(e) => push("status", e.target.value)}
        options={statusOptions}
        className="sm:w-48"
      />
    </div>
  );
}
