"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const estadoOptions = [
  { value: "", label: "Todos los estados" },
  { value: "confirmada", label: "Confirmada" },
  { value: "cancelada", label: "Cancelada" },
  { value: "pendiente", label: "Pendiente" },
];

export function TelegramCitasFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const push = useCallback((key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.delete("page");
    router.push(`?${p.toString()}`);
  }, [router, params]);

  return (
    <div className="flex flex-wrap gap-3">
      <div className="w-56">
        <Input
          placeholder="Buscar cliente o teléfono..."
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => push("q", e.target.value)}
        />
      </div>
      <div className="w-44">
        <Select
          options={estadoOptions}
          defaultValue={params.get("estado") ?? ""}
          onChange={(e) => push("estado", e.target.value)}
        />
      </div>
      <div className="w-40">
        <Input
          type="date"
          defaultValue={params.get("fecha") ?? ""}
          onChange={(e) => push("fecha", e.target.value)}
        />
      </div>
    </div>
  );
}
