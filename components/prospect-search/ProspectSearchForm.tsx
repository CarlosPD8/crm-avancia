"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { prospectSearchSchema, type ProspectSearchFormValues } from "@/lib/validators/prospect-search.schema";
import { searchProspects } from "@/actions/prospect-search";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { ProspectResult } from "@/types";

interface ProspectSearchFormProps {
  onResults: (results: ProspectResult[]) => void;
  onError?: (message: string) => void;
}

const companySizeOptions = [
  { value: "", label: "Cualquier tamaño" },
  { value: "1-10", label: "1–10 empleados" },
  { value: "11-50", label: "11–50 empleados" },
  { value: "51-200", label: "51–200 empleados" },
  { value: "201-500", label: "201–500 empleados" },
  { value: "500+", label: "Más de 500 empleados" },
];

export function ProspectSearchForm({ onResults, onError }: ProspectSearchFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProspectSearchFormValues>({
    resolver: zodResolver(prospectSearchSchema),
    defaultValues: {
      industry: "",
      location: "",
      companySize: "",
      keywords: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await searchProspects(data);
      if (result.success) {
        onResults(result.data);
      } else {
        onError?.(result.error);
      }
    });
  });

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="mb-5">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Parámetros de búsqueda</h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
          Define los criterios para encontrar nuevos clientes potenciales.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Sector objetivo"
            placeholder="ej. Inmobiliaria, Clínica..."
            error={errors.industry?.message}
            {...register("industry")}
          />
          <Input
            label="Ciudad o país"
            placeholder="ej. Madrid, España..."
            error={errors.location?.message}
            {...register("location")}
          />
          <Select
            label="Tamaño de empresa"
            options={companySizeOptions}
            {...register("companySize")}
          />
          <Input
            label="Palabras clave"
            placeholder="ej. automatización, CRM..."
            {...register("keywords")}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={isPending}>
            <Search className="h-4 w-4" />
            {isPending ? "Buscando..." : "Buscar clientes"}
          </Button>
        </div>
      </form>

      <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: "1px solid var(--border)" }}>
        <span
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: "var(--success-muted)", color: "var(--success)", border: "1px solid var(--success-light)" }}
        >
          ● Google Places
        </span>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          <span className="font-medium" style={{ color: "var(--text-2)" }}>Próximas integraciones: </span>
          LinkedIn · Apollo · Clay · Clearbit · SerpAPI
        </p>
      </div>
    </div>
  );
}
