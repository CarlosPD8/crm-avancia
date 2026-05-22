"use client";

import { useEffect } from "react";
import type { InvoiceStatus, PaymentMethod } from "@prisma/client";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Borrador", SENT: "Enviada", PARTIAL: "Pago parcial",
  PAID: "Pagada", OVERDUE: "Vencida", CANCELLED: "Cancelada",
};
const METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: "Transferencia", CARD: "Tarjeta", CASH: "Efectivo", CHEQUE: "Cheque", OTHER: "Otro",
};

function fmt(n: number) {
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

type Invoice = {
  number: string; companyName: string; contactName: string; email: string;
  phone: string | null; address: string | null; taxId: string | null;
  subtotal: number; taxRate: number; taxAmount: number; discountAmount: number;
  total: number; paidAmount: number; status: InvoiceStatus;
  issueDate: string; dueDate: string; notes: string | null;
  items: { id: string; description: string; quantity: number; unitPrice: number; total: number }[];
  payments: { id: string; amount: number; method: PaymentMethod; date: string }[];
};

export function PrintInvoice({ invoice }: { invoice: Invoice }) {
  useEffect(() => {
    document.title = `Factura ${invoice.number}`;
  }, [invoice.number]);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }
        .page { max-width: 800px; margin: 0 auto; padding: 48px 48px 64px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
        .company-name { font-size: 24px; font-weight: 800; color: #111; }
        .invoice-number { font-size: 20px; font-weight: 700; color: #111; text-align: right; }
        .invoice-meta { color: #666; font-size: 12px; text-align: right; margin-top: 4px; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 8px; background: #f3f4f6; color: #374151; }
        .divider { border: none; border-top: 1px solid #e5e7eb; margin: 32px 0; }
        .section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
        .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 8px; }
        .section-value { font-size: 13px; color: #374151; line-height: 1.6; }
        .section-value strong { color: #111; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #9ca3af; border-bottom: 2px solid #e5e7eb; }
        thead th.right { text-align: right; }
        tbody td { padding: 12px 12px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: top; }
        tbody td.right { text-align: right; font-variant-numeric: tabular-nums; }
        tbody td.bold { font-weight: 600; color: #111; }
        .totals { display: flex; justify-content: flex-end; }
        .totals-box { width: 280px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; color: #374151; }
        .total-final { display: flex; justify-content: space-between; padding: 12px 0 0; font-size: 16px; font-weight: 800; color: #111; }
        .payments { margin-top: 40px; }
        .payment-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
        .notes-box { margin-top: 40px; padding: 16px; background: #f9fafb; border-radius: 8px; }
        .footer { margin-top: 64px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 11px; color: #9ca3af; }
        .print-btn { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #111; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; z-index: 100; }
        @media print {
          .print-btn { display: none; }
          body { print-color-adjust: exact; }
          .page { padding: 32px; }
        }
      `}</style>

      <button className="print-btn" onClick={() => window.print()}>Imprimir / Guardar PDF</button>

      <div className="page">
        {/* Header */}
        <div className="header">
          <div>
            <div className="company-name">Avancia Tech</div>
            <div style={{ color: "#666", fontSize: "12px", marginTop: "6px", lineHeight: "1.6" }}>
              avanciatech.com<br />
              facturacion@avanciatech.com
            </div>
          </div>
          <div>
            <div className="invoice-number">{invoice.number}</div>
            <div className="invoice-meta">
              Emitida: {fmtDate(invoice.issueDate)}<br />
              Vence: {fmtDate(invoice.dueDate)}
            </div>
            <div><span className="status-badge">{STATUS_LABELS[invoice.status]}</span></div>
          </div>
        </div>

        <hr className="divider" />

        {/* Client info */}
        <div className="section-grid">
          <div>
            <div className="section-label">Facturado a</div>
            <div className="section-value">
              <strong>{invoice.companyName}</strong><br />
              {invoice.contactName}<br />
              {invoice.email}<br />
              {invoice.phone && <>{invoice.phone}<br /></>}
              {invoice.address && <>{invoice.address}<br /></>}
              {invoice.taxId && <>CIF/NIF: {invoice.taxId}</>}
            </div>
          </div>
          <div>
            <div className="section-label">Resumen</div>
            <div className="section-value">
              <strong>Total: {fmt(invoice.total)}</strong><br />
              Cobrado: {fmt(invoice.paidAmount)}<br />
              Pendiente: {fmt(Math.max(0, invoice.total - invoice.paidAmount))}
            </div>
          </div>
        </div>

        {/* Items */}
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th className="right" style={{ width: "80px" }}>Cant.</th>
              <th className="right" style={{ width: "120px" }}>Precio unit.</th>
              <th className="right" style={{ width: "120px" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className="right">{item.quantity}</td>
                <td className="right">{fmt(item.unitPrice)}</td>
                <td className="right bold">{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="totals">
          <div className="totals-box">
            <div className="total-row"><span>Subtotal</span><span>{fmt(invoice.subtotal)}</span></div>
            {invoice.discountAmount > 0 && (
              <div className="total-row"><span>Descuento</span><span style={{ color: "#dc2626" }}>-{fmt(invoice.discountAmount)}</span></div>
            )}
            <div className="total-row"><span>IVA ({invoice.taxRate}%)</span><span>{fmt(invoice.taxAmount)}</span></div>
            <div className="total-final"><span>Total</span><span>{fmt(invoice.total)}</span></div>
          </div>
        </div>

        {/* Payment history */}
        {invoice.payments.length > 0 && (
          <div className="payments">
            <div className="section-label">Historial de pagos</div>
            {invoice.payments.map((p) => (
              <div key={p.id} className="payment-row">
                <span>{fmtDate(p.date)} — {METHOD_LABELS[p.method]}</span>
                <span style={{ fontWeight: 600, color: "#16a34a" }}>{fmt(p.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {invoice.notes && (
          <div className="notes-box">
            <div className="section-label" style={{ marginBottom: "6px" }}>Notas</div>
            <div style={{ color: "#374151", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{invoice.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <span>Generado por CRM Avancia</span>
          <span>{invoice.number} · {new Date().toLocaleDateString("es-ES")}</span>
        </div>
      </div>
    </>
  );
}
