"use client";

import { useRouter } from "next/navigation";
import { Receipt, ExternalLink } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { DeleteInvoiceButton } from "@/app/invoices/DeleteInvoiceButton";
import { formatCreatedAt } from "@/lib/utils";
import type { InvoiceStatus } from "@prisma/client";

export type SerializedInvoice = {
  id: string;
  number: string;
  companyName: string;
  contactName: string;
  email: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  sentAt: string | null;
  createdAt: string;
};

function formatEur(value: number) {
  return value.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
}

const columns: Column<SerializedInvoice>[] = [
  {
    key: "number",
    label: "Nº Factura",
    sortable: true,
    render: (val, row) => (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 theme-avatar-accent">
          <Receipt className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="font-medium font-mono text-xs" style={{ color: "var(--text-1)" }}>{String(val)}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{row.companyName}</p>
        </div>
      </div>
    ),
  },
  {
    key: "contactName",
    label: "Cliente",
    render: (val, row) => (
      <div>
        <p className="text-sm" style={{ color: "var(--text-1)" }}>{String(val)}</p>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>{row.email}</p>
      </div>
    ),
  },
  {
    key: "total",
    label: "Total",
    sortable: true,
    render: (val) => (
      <span className="font-semibold tabular-nums" style={{ color: "var(--text-1)" }}>
        {formatEur(Number(val))}
      </span>
    ),
  },
  {
    key: "paidAmount",
    label: "Pagado",
    render: (val, row) => {
      const pending = row.total - row.paidAmount;
      return (
        <div>
          <p className="text-sm tabular-nums" style={{ color: "var(--success)" }}>{formatEur(Number(val))}</p>
          {pending > 0.01 && (
            <p className="text-xs tabular-nums" style={{ color: "var(--danger)" }}>
              -{formatEur(pending)} pdte.
            </p>
          )}
        </div>
      );
    },
  },
  {
    key: "status",
    label: "Estado",
    render: (val) => <InvoiceStatusBadge status={val as InvoiceStatus} />,
  },
  {
    key: "dueDate",
    label: "Vencimiento",
    sortable: true,
    render: (val) => (
      <span className="text-xs" style={{ color: "var(--text-2)" }}>{formatCreatedAt(String(val))}</span>
    ),
  },
  {
    key: "issueDate",
    label: "Emisión",
    sortable: true,
    render: (val) => (
      <span className="text-xs" style={{ color: "var(--text-3)" }}>{formatCreatedAt(String(val))}</span>
    ),
  },
];

export function InvoicesTable({ invoices }: { invoices: SerializedInvoice[] }) {
  const router = useRouter();
  return (
    <DataTable<SerializedInvoice>
      columns={columns}
      data={invoices}
      emptyIcon={Receipt}
      emptyTitle="Sin facturas"
      emptyDescription="Crea tu primera factura para empezar."
      onRowDoubleClick={(row) => router.push(`/invoices/${row.id}`)}
      actions={(row) => (
        <div className="flex items-center gap-1">
          <a
            href={`/invoices/${row.id}/print`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg transition-opacity hover:opacity-60"
            style={{ color: "var(--text-3)" }}
            title="Ver / Descargar PDF"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <DeleteInvoiceButton id={row.id} />
        </div>
      )}
    />
  );
}
