"use client";

import { useRouter } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ProposalStatusBadge } from "./ProposalStatusBadge";
import { DeleteProposalButton } from "@/app/proposals/DeleteProposalButton";
import { formatCreatedAt } from "@/lib/utils";
import type { ProposalStatus } from "@prisma/client";

export type SerializedProposal = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  status: ProposalStatus;
  value: number | null;
  pdfPath: string | null;
  pdfName: string | null;
  sentAt: string | null;
  createdAt: string;
};

const columns: Column<SerializedProposal>[] = [
  {
    key: "companyName",
    label: "Empresa",
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 theme-avatar-accent">
          <span className="text-xs font-semibold">{row.companyName.charAt(0)}</span>
        </div>
        <div>
          <p className="font-medium" style={{ color: "var(--text-1)" }}>{row.companyName}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{row.contactName}</p>
        </div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Estado",
    render: (val) => <ProposalStatusBadge status={val as ProposalStatus} />,
  },
  {
    key: "value",
    label: "Valor",
    sortable: true,
    render: (val) =>
      val != null ? (
        <span className="font-medium tabular-nums" style={{ color: "var(--text-1)" }}>
          {Number(val).toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
        </span>
      ) : (
        <span style={{ color: "var(--text-3)" }}>—</span>
      ),
  },
  {
    key: "pdfName",
    label: "Dosier",
    render: (_, row) =>
      row.pdfPath ? (
        <a
          href={`/api/files/${row.pdfPath}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--accent)" }}
        >
          <FileText className="h-3.5 w-3.5" />
          {row.pdfName ?? "PDF"}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className="text-xs" style={{ color: "var(--text-3)" }}>Sin PDF</span>
      ),
  },
  {
    key: "sentAt",
    label: "Enviado",
    render: (val) => (
      <span className="text-xs" style={{ color: "var(--text-2)" }}>
        {val ? formatCreatedAt(String(val)) : "—"}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Creado",
    sortable: true,
    render: (val) => (
      <span className="text-xs" style={{ color: "var(--text-3)" }}>{formatCreatedAt(String(val))}</span>
    ),
  },
];

export function ProposalsTable({ proposals }: { proposals: SerializedProposal[] }) {
  const router = useRouter();
  return (
    <DataTable<SerializedProposal>
      columns={columns}
      data={proposals}
      emptyTitle="Sin propuestas"
      emptyDescription="Crea tu primera propuesta para empezar."
      onRowDoubleClick={(row) => router.push(`/proposals/${row.id}`)}
      actions={(row) => <DeleteProposalButton id={row.id} />}
    />
  );
}
