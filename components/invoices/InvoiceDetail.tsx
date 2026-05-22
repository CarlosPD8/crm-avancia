"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CreditCard, Pencil, Ban, CheckCircle2 } from "lucide-react";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceForm } from "./InvoiceForm";
import { PaymentModal } from "./PaymentModal";
import { markInvoiceSent, cancelInvoice } from "@/actions/invoices";
import { Button } from "@/components/ui/Button";
import { formatCreatedAt } from "@/lib/utils";
import type { InvoiceStatus, PaymentMethod } from "@prisma/client";

type Payment = { id: string; amount: number; method: PaymentMethod; date: string; notes: string | null };

type InvoiceData = {
  id: string; number: string; companyName: string; contactName: string; email: string;
  phone: string | null; address: string | null; taxId: string | null;
  leadId: string | null; proposalId: string | null;
  subtotal: number; taxRate: number; taxAmount: number; discountAmount: number;
  total: number; paidAmount: number;
  status: InvoiceStatus; issueDate: string; dueDate: string; sentAt: string | null;
  isRecurring: boolean; recurringPeriod: string | null; notes: string | null;
  items: { id: string; description: string; quantity: number; unitPrice: number; total: number }[];
  payments: Payment[];
  lead: { id: string; companyName: string } | null;
  proposal: { id: string; companyName: string } | null;
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: "Transferencia", CARD: "Tarjeta", CASH: "Efectivo", CHEQUE: "Cheque", OTHER: "Otro",
};

function formatEur(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-4 py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="text-xs" style={{ color: "var(--text-3)" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{value}</span>
    </div>
  );
}

export function InvoiceDetail({
  invoice, leads, proposals,
}: {
  invoice: InvoiceData;
  leads: { id: string; companyName: string }[];
  proposals: { id: string; companyName: string }[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const pendingAmount = Math.max(0, invoice.total - invoice.paidAmount);
  const canPay = !["PAID", "CANCELLED", "DRAFT"].includes(invoice.status) || invoice.status === "PARTIAL";
  const canSend = invoice.status === "DRAFT";
  const canCancel = !["CANCELLED", "PAID"].includes(invoice.status);

  const handleSend = async () => {
    setLoading("send");
    await markInvoiceSent(invoice.id);
    setLoading(null);
    router.refresh();
  };

  const handleCancel = async () => {
    if (!confirm("¿Cancelar esta factura?")) return;
    setLoading("cancel");
    await cancelInvoice(invoice.id);
    setLoading(null);
    router.refresh();
  };

  if (editing) {
    return (
      <InvoiceForm
        invoice={{
          ...invoice,
          items: invoice.items.map((i) => ({ ...i, id: i.id })),
        }}
        leads={leads}
        proposals={proposals}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" />Editar
        </Button>
        {canSend && (
          <Button onClick={handleSend} isLoading={loading === "send"}>
            <Send className="h-4 w-4" />Marcar como enviada
          </Button>
        )}
        {(canPay || invoice.status === "SENT" || invoice.status === "OVERDUE") && pendingAmount > 0 && (
          <Button variant="secondary" onClick={() => setPaymentOpen(true)}>
            <CreditCard className="h-4 w-4" />Registrar pago
          </Button>
        )}
        {canCancel && (
          <Button variant="danger" onClick={handleCancel} isLoading={loading === "cancel"}>
            <Ban className="h-4 w-4" />Cancelar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: invoice details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-2xl font-bold font-mono" style={{ color: "var(--text-1)" }}>{invoice.number}</p>
                <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
                  Emitida: {formatCreatedAt(invoice.issueDate)} · Vence: {formatCreatedAt(invoice.dueDate)}
                </p>
              </div>
              <InvoiceStatusBadge status={invoice.status} size="md" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>Cliente</p>
                <p className="font-semibold" style={{ color: "var(--text-1)" }}>{invoice.companyName}</p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>{invoice.contactName}</p>
                <p className="text-sm" style={{ color: "var(--text-2)" }}>{invoice.email}</p>
                {invoice.phone && <p className="text-sm" style={{ color: "var(--text-2)" }}>{invoice.phone}</p>}
                {invoice.address && <p className="text-sm" style={{ color: "var(--text-2)" }}>{invoice.address}</p>}
                {invoice.taxId && <p className="text-sm" style={{ color: "var(--text-2)" }}>CIF: {invoice.taxId}</p>}
              </div>
              <div>
                {invoice.lead && (
                  <div className="mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Lead asociado</p>
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>{invoice.lead.companyName}</p>
                  </div>
                )}
                {invoice.proposal && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Propuesta asociada</p>
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>{invoice.proposal.companyName}</p>
                  </div>
                )}
                {invoice.isRecurring && invoice.recurringPeriod && (
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-3)" }}>Recurrencia</p>
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>{invoice.recurringPeriod}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Conceptos</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Descripción", "Cant.", "Precio unit.", "Total"].map((h, i) => (
                    <th
                      key={h}
                      className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${i > 0 ? "text-right" : ""}`}
                      style={{ color: "var(--text-3)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-6 py-3" style={{ color: "var(--text-1)" }}>{item.description}</td>
                    <td className="px-6 py-3 text-right tabular-nums" style={{ color: "var(--text-2)" }}>{item.quantity}</td>
                    <td className="px-6 py-3 text-right tabular-nums" style={{ color: "var(--text-2)" }}>{formatEur(item.unitPrice)}</td>
                    <td className="px-6 py-3 text-right tabular-nums font-medium" style={{ color: "var(--text-1)" }}>{formatEur(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-4 flex justify-end">
              <div className="w-64 space-y-1.5">
                <Row label="Subtotal" value={formatEur(invoice.subtotal)} />
                {invoice.discountAmount > 0 && (
                  <Row label="Descuento" value={<span style={{ color: "var(--danger)" }}>-{formatEur(invoice.discountAmount)}</span>} />
                )}
                <Row label={`IVA (${invoice.taxRate}%)`} value={formatEur(invoice.taxAmount)} />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold" style={{ color: "var(--text-1)" }}>Total</span>
                  <span className="text-lg font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{formatEur(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-3)" }}>Notas</p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Right: payment summary */}
        <div className="space-y-6">
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>Resumen de cobro</p>

            <div className="space-y-3">
              <div className="rounded-xl p-4 text-center" style={{ background: "var(--bg-elevated)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-3)" }}>Total factura</p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{formatEur(invoice.total)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-3 text-center" style={{ background: "var(--success-muted)" }}>
                  <p className="text-xs mb-0.5" style={{ color: "var(--success)" }}>Cobrado</p>
                  <p className="font-bold tabular-nums text-sm" style={{ color: "var(--success)" }}>{formatEur(invoice.paidAmount)}</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background: pendingAmount > 0 ? "var(--danger-muted)" : "var(--success-muted)" }}>
                  <p className="text-xs mb-0.5" style={{ color: pendingAmount > 0 ? "var(--danger)" : "var(--success)" }}>Pendiente</p>
                  <p className="font-bold tabular-nums text-sm" style={{ color: pendingAmount > 0 ? "var(--danger)" : "var(--success)" }}>
                    {formatEur(pendingAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment history */}
          {invoice.payments.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-3)" }}>Historial de pagos</p>
              <div className="space-y-2">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between gap-2 py-1.5" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-1)" }}>{formatEur(p.amount)}</p>
                      <p className="text-xs" style={{ color: "var(--text-3)" }}>{METHOD_LABELS[p.method]} · {formatCreatedAt(p.date)}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--success)" }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PaymentModal
        invoiceId={invoice.id}
        pendingAmount={pendingAmount}
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
      />
    </div>
  );
}
