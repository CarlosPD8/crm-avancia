"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { leadSchema } from "@/lib/validators/lead.schema";
import { createLead, updateLead } from "@/actions/leads";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Lead } from "@/types";
import type { z } from "zod";

type FormValues = z.input<typeof leadSchema>;

interface LeadFormProps {
  lead?: Lead;
  defaultValues?: Partial<FormValues>;
  onSuccess?: () => void;
}

const statusOptions = [
  { value: "NEW", label: "Nuevo" },
  { value: "CONTACTED", label: "Contactado" },
  { value: "QUALIFIED", label: "Cualificado" },
  { value: "DISCARDED", label: "Descartado" },
  { value: "CONVERTED", label: "Convertido" },
];

const sourceOptions = [
  { value: "MANUAL", label: "Manual" },
  { value: "GOOGLE_PLACES", label: "Google Places" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "APOLLO", label: "Apollo" },
  { value: "CLAY", label: "Clay" },
  { value: "CLEARBIT", label: "Clearbit" },
  { value: "SERPAPI", label: "SerpAPI" },
  { value: "REFERRAL", label: "Referido" },
  { value: "WEBSITE", label: "Web" },
  { value: "OTHER", label: "Otro" },
];

const industryOptions = [
  { value: "Inmobiliaria", label: "Inmobiliaria" },
  { value: "Clínica", label: "Clínica / Salud" },
  { value: "Asesoría", label: "Asesoría / Contabilidad" },
  { value: "Despacho Legal", label: "Despacho Legal" },
  { value: "Ecommerce", label: "Ecommerce" },
  { value: "Restauración", label: "Restauración" },
  { value: "Tecnología", label: "Tecnología" },
  { value: "Educación", label: "Educación" },
  { value: "Logística", label: "Logística" },
  { value: "Otro", label: "Otro" },
];

export function LeadForm({ lead, defaultValues, onSuccess }: LeadFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!lead;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      companyName: lead?.companyName ?? defaultValues?.companyName ?? "",
      contactName: lead?.contactName ?? defaultValues?.contactName ?? "",
      email: lead?.email ?? defaultValues?.email ?? "",
      phone: lead?.phone ?? defaultValues?.phone ?? "",
      website: lead?.website ?? defaultValues?.website ?? "",
      industry: lead?.industry ?? defaultValues?.industry ?? "",
      source: lead?.source ?? defaultValues?.source ?? "MANUAL",
      status: lead?.status ?? defaultValues?.status ?? "NEW",
      notes: lead?.notes ?? defaultValues?.notes ?? "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateLead(lead.id, data)
        : await createLead(data);

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof FormValues, { message: messages[0] });
          });
        }
        return;
      }

      onSuccess?.();
      router.push("/leads");
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Empresa"
          placeholder="Nombre de la empresa"
          error={errors.companyName?.message}
          {...register("companyName")}
        />
        <Input
          label="Nombre del contacto"
          placeholder="Nombre completo"
          error={errors.contactName?.message}
          {...register("contactName")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="correo@empresa.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Teléfono"
          type="tel"
          placeholder="+34 600 000 000"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Sitio web"
          type="url"
          placeholder="https://empresa.com"
          error={errors.website?.message}
          {...register("website")}
        />
        <Select
          label="Sector"
          options={industryOptions}
          placeholder="Selecciona un sector"
          error={errors.industry?.message}
          {...register("industry")}
        />
        <Select
          label="Fuente"
          options={sourceOptions}
          error={errors.source?.message}
          {...register("source")}
        />
        <Select
          label="Estado"
          options={statusOptions}
          error={errors.status?.message}
          {...register("status")}
        />
      </div>
      <Textarea
        label="Notas"
        placeholder="Notas adicionales sobre el lead..."
        rows={3}
        error={errors.notes?.message}
        {...register("notes")}
      />
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? "Guardar cambios" : "Crear lead"}
        </Button>
      </div>
    </form>
  );
}
