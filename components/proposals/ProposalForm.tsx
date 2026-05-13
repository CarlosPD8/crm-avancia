"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, ExternalLink } from "lucide-react";
import { proposalSchema, type ProposalFormValues } from "@/lib/validators/proposal.schema";
import { createProposal, updateProposal } from "@/actions/proposals";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

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
  pdfPath: string | null;
  pdfName: string | null;
  pdfSize: number | null;
  sentAt: string | null;
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

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProposalForm({ proposal, leads }: ProposalFormProps) {
  const router = useRouter();
  const isEditing = !!proposal;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, setIsPending] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfRemoved, setPdfRemoved] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

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

  // Auto-fill client info when a lead is selected (new proposals only)
  useEffect(() => {
    if (isEditing || !watchedLeadId) return;
    const lead = leads.find((l) => l.id === watchedLeadId);
    if (!lead) return;
    setValue("companyName", lead.companyName);
    setValue("contactName", lead.contactName);
    setValue("email", lead.email);
    setValue("phone", lead.phone ?? "");
  }, [watchedLeadId, leads, isEditing, setValue]);

  const currentPdfName = pdfRemoved ? null : (pdfFile?.name ?? proposal?.pdfName ?? null);
  const currentPdfSize = pdfRemoved ? null : (pdfFile?.size ?? proposal?.pdfSize ?? null);
  const currentPdfPath = pdfRemoved ? null : (pdfFile ? null : proposal?.pdfPath ?? null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setUploadError("Solo se permiten archivos PDF");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError("El archivo no puede superar 20 MB");
      return;
    }
    setUploadError(null);
    setPdfRemoved(false);
    setPdfFile(file);
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsPending(true);
    setFormError(null);
    setUploadError(null);

    try {
      let pdfPath = pdfRemoved ? null : (proposal?.pdfPath ?? null);
      let pdfName = pdfRemoved ? null : (proposal?.pdfName ?? null);
      let pdfSize = pdfRemoved ? null : (proposal?.pdfSize ?? null);

      if (pdfFile) {
        const fd = new FormData();
        fd.append("file", pdfFile);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) {
          setUploadError(json.error ?? "Error al subir el PDF");
          setIsPending(false);
          return;
        }
        pdfPath = json.filename;
        pdfName = json.originalName;
        pdfSize = json.size;
      }

      const payload = { ...data, pdfPath, pdfName, pdfSize };
      const result = isEditing
        ? await updateProposal(proposal.id, payload)
        : await createProposal(payload);

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
          <div /> {/* spacer */}
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

      {/* PDF */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
        {sectionTitle("Dosier PDF")}

        {currentPdfName ? (
          <div
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--accent-light)" }}>
                <FileText className="h-4 w-4" style={{ color: "var(--accent)" }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>{currentPdfName}</p>
                {currentPdfSize && (
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>{formatBytes(currentPdfSize)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {currentPdfPath && (
                <a
                  href={`/api/files/${currentPdfPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                  style={{ color: "var(--accent)" }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir
                </a>
              )}
              <button
                type="button"
                onClick={() => { setPdfFile(null); setPdfRemoved(true); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="rounded-lg p-1.5 transition-colors"
                style={{ color: "var(--text-3)" }}
                title="Quitar PDF"
              >
                <X className="h-4 w-4" />
              </button>
              <Button type="button" size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                Reemplazar
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 rounded-xl py-8 transition-colors"
            style={{ border: "1.5px dashed var(--border-strong)", background: "var(--bg-input)", color: "var(--text-3)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
          >
            <Upload className="h-6 w-6" />
            <span className="text-sm font-medium">Haz clic para seleccionar el PDF</span>
            <span className="text-xs">Máximo 20 MB</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        {uploadError && (
          <p className="mt-2 text-xs" style={{ color: "var(--danger)" }}>{uploadError}</p>
        )}
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
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? "Guardar cambios" : "Crear propuesta"}
        </Button>
      </div>
    </form>
  );
}
