"use client";

import { useState, useCallback } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { invoiceSchema, type InvoiceSchema } from "@/lib/validators/invoice.schema";
import { createInvoice, updateInvoice } from "@/actions/invoices";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

type InvoiceWithRelations = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  address: string | null;
  taxId: string | null;
  leadId: string | null;
  proposalId: string | null;
  taxRate: number;
  discountAmount: number;
  issueDate: string;
  dueDate: string;
  isRecurring: boolean;
  recurringPeriod: string | null;
  notes: string | null;
  items: { id: string; description: string; quantity: number; unitPrice: number }[];
};

interface InvoiceFormProps {
  invoice?: InvoiceWithRelations;
  leads?: { id: string; companyName: string }[];
  proposals?: { id: string; companyName: string; number?: string }[];
}

const recurringOptions = [
  { value: "", label: "Sin recurrencia" },
  { value: "monthly", label: "Mensual" },
  { value: "quarterly", label: "Trimestral" },
  { value: "biannual", label: "Semestral" },
  { value: "yearly", label: "Anual" },
];

function formatEur(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-3)" }}>
      {children}
    </h3>
  );
}

export function InvoiceForm({ invoice, leads = [], proposals = [] }: InvoiceFormProps) {
  const router = useRouter();
  const isEditing = !!invoice;
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultIssueDate = invoice
    ? new Date(invoice.issueDate).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const defaultDueDate = invoice
    ? new Date(invoice.dueDate).toISOString().split("T")[0]
    : (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split("T")[0];
      })();

  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<InvoiceSchema>({
      resolver: zodResolver(invoiceSchema),
      defaultValues: {
        companyName: invoice?.companyName ?? "",
        contactName: invoice?.contactName ?? "",
        email: invoice?.email ?? "",
        phone: invoice?.phone ?? "",
        address: invoice?.address ?? "",
        taxId: invoice?.taxId ?? "",
        leadId: invoice?.leadId ?? "",
        proposalId: invoice?.proposalId ?? "",
        taxRate: invoice?.taxRate ?? 21,
        discountAmount: invoice?.discountAmount ?? 0,
        issueDate: defaultIssueDate,
        dueDate: defaultDueDate,
        isRecurring: invoice?.isRecurring ?? false,
        recurringPeriod: invoice?.recurringPeriod ?? "",
        notes: invoice?.notes ?? "",
        items: invoice?.items?.length
          ? invoice.items.map((i) => ({ id: i.id, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice }))
          : [{ description: "", quantity: 1, unitPrice: 0 }],
      },
    });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const watchedItems = useWatch({ control, name: "items" }) ?? [];
  const watchedTaxRate = useWatch({ control, name: "taxRate" }) ?? 21;
  const watchedDiscount = useWatch({ control, name: "discountAmount" }) ?? 0;

  const subtotal = watchedItems.reduce((s, i) => s + (Number(i?.quantity) || 0) * (Number(i?.unitPrice) || 0), 0);
  const discounted = Math.max(0, subtotal - (Number(watchedDiscount) || 0));
  const taxAmount = discounted * ((Number(watchedTaxRate) || 0) / 100);
  const total = discounted + taxAmount;

  const onSubmit = useCallback(async (data: InvoiceSchema) => {
    setServerError(null);
    const result = isEditing
      ? await updateInvoice(invoice!.id, data)
      : await createInvoice(data);

    if (!result.success) {
      setServerError(result.error);
      if (result.fieldErrors) {
        for (const [field, msgs] of Object.entries(result.fieldErrors)) {
          setError(field as keyof InvoiceSchema, { message: (msgs as string[])[0] });
        }
      }
      return;
    }

    const id = isEditing ? invoice!.id : (result as { success: true; data: { id: string } }).data.id;
    router.push(`/invoices/${id}`);
  }, [isEditing, invoice, router, setError]);

  const leadOptions = [
    { value: "", label: "Sin lead asociado" },
    ...leads.map((l) => ({ value: l.id, label: l.companyName })),
  ];

  const proposalOptions = [
    { value: "", label: "Sin propuesta asociada" },
    ...proposals.map((p) => ({ value: p.id, label: p.companyName })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Client info */}
      <section
        className="rounded-2xl p-6 space-y-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <SectionTitle>Datos del cliente</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Empresa *</label>
            <Input {...register("companyName")} placeholder="Nombre de empresa" error={errors.companyName?.message} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Contacto *</label>
            <Input {...register("contactName")} placeholder="Nombre del contacto" error={errors.contactName?.message} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Email *</label>
            <Input {...register("email")} type="email" placeholder="email@empresa.com" error={errors.email?.message} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Teléfono</label>
            <Input {...register("phone")} placeholder="+34 600 000 000" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Dirección</label>
            <Input {...register("address")} placeholder="Calle, ciudad, CP" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>CIF / NIF</label>
            <Input {...register("taxId")} placeholder="B12345678" />
          </div>
        </div>

        {(leads.length > 0 || proposals.length > 0) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
            {leads.length > 0 && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Lead asociado</label>
                <Select options={leadOptions} {...register("leadId")} />
              </div>
            )}
            {proposals.length > 0 && (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Propuesta asociada</label>
                <Select options={proposalOptions} {...register("proposalId")} />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Invoice details */}
      <section
        className="rounded-2xl p-6 space-y-4"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <SectionTitle>Detalles de la factura</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Fecha de emisión *</label>
            <Input type="date" {...register("issueDate")} error={errors.issueDate?.message} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Fecha de vencimiento *</label>
            <Input type="date" {...register("dueDate")} error={errors.dueDate?.message} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Recurrencia</label>
            <Select options={recurringOptions} {...register("recurringPeriod")} />
          </div>
        </div>
      </section>

      {/* Line items */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <SectionTitle>Conceptos</SectionTitle>

        <div className="space-y-2 mb-4">
          {/* Header */}
          <div className="grid gap-2 text-xs font-medium mb-1 px-1" style={{ gridTemplateColumns: "1fr 80px 100px 80px 32px", color: "var(--text-3)" }}>
            <span>Descripción</span>
            <span className="text-right">Cantidad</span>
            <span className="text-right">Precio unit.</span>
            <span className="text-right">Total</span>
            <span />
          </div>

          {fields.map((field, index) => {
            const qty = Number(watchedItems[index]?.quantity) || 0;
            const price = Number(watchedItems[index]?.unitPrice) || 0;
            const lineTotal = qty * price;
            return (
              <div
                key={field.id}
                className="grid gap-2 items-start"
                style={{ gridTemplateColumns: "1fr 80px 100px 80px 32px" }}
              >
                <Input
                  {...register(`items.${index}.description`)}
                  placeholder="Descripción del servicio"
                  error={errors.items?.[index]?.description?.message}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  className="text-right"
                  error={errors.items?.[index]?.quantity?.message}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                  className="text-right"
                  error={errors.items?.[index]?.unitPrice?.message}
                />
                <div className="flex items-center h-10 justify-end">
                  <span className="text-sm font-medium tabular-nums" style={{ color: "var(--text-1)" }}>
                    {formatEur(lineTotal)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="h-10 w-8 flex items-center justify-center rounded-lg transition-opacity hover:opacity-60 disabled:opacity-20"
                  style={{ color: "var(--danger)" }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {errors.items?.root && (
          <p className="text-xs mb-2" style={{ color: "var(--danger)" }}>{errors.items.root.message}</p>
        )}

        <button
          type="button"
          onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--accent)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          Añadir concepto
        </button>

        {/* Totals */}
        <div
          className="mt-6 pt-4 space-y-2"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>IVA (%)</label>
              <Input type="number" step="0.01" min="0" max="100" {...register("taxRate", { valueAsNumber: true })} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-2)" }}>Descuento (€)</label>
              <Input type="number" step="0.01" min="0" {...register("discountAmount", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 text-sm">
            <div className="flex gap-8">
              <span style={{ color: "var(--text-3)" }}>Subtotal</span>
              <span className="tabular-nums w-28 text-right" style={{ color: "var(--text-2)" }}>{formatEur(subtotal)}</span>
            </div>
            {Number(watchedDiscount) > 0 && (
              <div className="flex gap-8">
                <span style={{ color: "var(--text-3)" }}>Descuento</span>
                <span className="tabular-nums w-28 text-right" style={{ color: "var(--danger)" }}>-{formatEur(Number(watchedDiscount))}</span>
              </div>
            )}
            <div className="flex gap-8">
              <span style={{ color: "var(--text-3)" }}>IVA ({watchedTaxRate}%)</span>
              <span className="tabular-nums w-28 text-right" style={{ color: "var(--text-2)" }}>{formatEur(taxAmount)}</span>
            </div>
            <div className="flex gap-8 pt-1.5" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="font-bold" style={{ color: "var(--text-1)" }}>Total</span>
              <span className="tabular-nums w-28 text-right font-bold text-base" style={{ color: "var(--text-1)" }}>{formatEur(total)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
      >
        <SectionTitle>Notas</SectionTitle>
        <Textarea
          {...register("notes")}
          rows={3}
          placeholder="Condiciones de pago, información adicional..."
        />
      </section>

      {serverError && (
        <p className="text-sm" style={{ color: "var(--danger)" }}>{serverError}</p>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? "Guardar cambios" : "Crear factura"}
        </Button>
      </div>
    </form>
  );
}
