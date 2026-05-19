"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { proposalSchema, type ProposalFormValues } from "@/lib/validators/proposal.schema";
import { createProposal, updateProposal } from "@/actions/proposals";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FileUploadZone, type PendingFile, type ExistingFile } from "@/components/ui/FileUploadZone";

type SerializedProposal = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  leadId: string | null;
  status: ProposalFormValues["status"];
  value: number | null;
  notes: string | null;
  sentAt: string | null;
  files: ExistingFile[];
};

type LeadOption = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
};

interface ProposalFormProps {
  proposal?: SerializedProposal;
  leads: LeadOption[];
}

const statusOptions = [
  { value: "DRAFT",       label: "Borrador" },
  { value: "SENT",        label: "Enviado" },
  { value: "NEGOTIATING", label: "Negociando" },
  { value: "ACCEPTED",    label: "Aceptado" },
  { value: "REJECTED",    label: "Rechazado" },
];

export function ProposalForm({ proposal, leads }: ProposalFormProps) {
  const router = useRouter();
  const isEditing = !!proposal;

  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);

  const leadOptions = [
    { value: "", label: "Sin enlazar" },
    ...leads.map((l) => ({ value: l.id, label: `${l.companyName} — ${l.contactName}` })),
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      companyName: proposal?.companyName ?? "",
      contactName: proposal?.contactName ?? "",
      email: proposal?.email ?? "",
      phone: proposal?.phone ?? "",
      leadId: proposal?.leadId ?? "",
      status: proposal?.status ?? "DRAFT",
      value: proposal?.value ?? undefined,
      notes: proposal?.notes ?? "",
      sentAt: proposal?.sentAt ?? "",
    },
  });

  const watchedLeadId = watch("leadId");

  useEffect(() => {
    if (isEditing || !watchedLeadId) return;
    const lead = leads.find((l) => l.id === watchedLeadId);
    if (!lead) return;
    setValue("companyName", lead.companyName);
    setValue("contactName", lead.contactName);
    setValue("email", lead.email);
    setValue("phone", lead.phone ?? "");
  }, [watchedLeadId, leads, isEditing, setValue]);

  // Existing files filtered (remove ones already marked for deletion)
  const existingFiles = (proposal?.files ?? []).filter((f) => !removedFileIds.includes(f.id));

  const onSubmit = handleSubmit(async (data) => {
    setIsPending(true);
    setFormError(null);

    try {
      const result = isEditing
        ? await updateProposal(proposal.id, data, pendingFiles, removedFileIds)
        : await createProposal(data, pendingFiles);

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            setError(field as keyof ProposalFormValues, { message: messages[0] });
          });
        }
        setFormError(result.error);
        return;
      }

      router.push("/proposals");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  });

  const sectionTitle = (text: string) => (
    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-3)" }}>
      {text}
    </p>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Cliente */}
      <div>
        {sectionTitle("Datos del cliente")}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Enlazar con lead existente"
            options={leadOptions}
            {...register("leadId")}
          />
          <div />
          <Input label="Empresa" placeholder="Nombre de la empresa" error={errors.companyName?.message} {...register("companyName")} />
          <Input label="Persona de contacto" placeholder="Nombre completo" error={errors.contactName?.message} {...register("contactName")} />
          <Input label="Email" type="email" placeholder="correo@empresa.com" error={errors.email?.message} {...register("email")} />
          <Input label="Teléfono" type="tel" placeholder="+34 600 000 000" error={errors.phone?.message} {...register("phone")} />
        </div>
      </div>

      {/* Propuesta */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
        {sectionTitle("Detalles de la propuesta")}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select label="Estado" options={statusOptions} error={errors.status?.message} {...register("status")} />
          <Input label="Valor estimado (€)" type="number" placeholder="5000" error={errors.value?.message} {...register("value")} />
          <Input label="Fecha de envío" type="date" error={errors.sentAt?.message} {...register("sentAt")} />
        </div>
      </div>

      {/* Archivos */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
        {sectionTitle("Archivos adjuntos")}
        <FileUploadZone
          existingFiles={existingFiles}
          pendingFiles={pendingFiles}
          onPendingAdd={(files) => setPendingFiles((prev) => [...prev, ...files])}
          onPendingRemove={(filename) => setPendingFiles((prev) => prev.filter((f) => f.filename !== filename))}
          onExistingRemove={(id) => setRemovedFileIds((prev) => [...prev, id])}
        />
      </div>

      {/* Notas */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
        {sectionTitle("Notas internas")}
        <Textarea label="" placeholder="Información relevante, condiciones especiales, próximos pasos..." rows={3} {...register("notes")} />
      </div>

      {formError && (
        <p className="text-sm" style={{ color: "var(--danger)" }}>{formError}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? "Guardar cambios" : "Crear propuesta"}
        </Button>
      </div>
    </form>
  );
}
