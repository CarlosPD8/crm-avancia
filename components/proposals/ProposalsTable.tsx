"use client";

import { useRouter } from "next/navigation";
import { FileText, ExternalLink, Files } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ProposalStatusBadge } from "./ProposalStatusBadge";
import { DeleteProposalButton } from "@/app/proposals/DeleteProposalButton";
import { formatCreatedAt } from "@/lib/utils";
import type { ProposalStatus } from "@prisma/client";

type ProposalFile = { id: string; filename: string; originalName: string; size: number };

export type SerializedProposal = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  status: ProposalStatus;
  value: number | null;
  files: ProposalFile[];
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
    key: "files",
    label: "Archivos",
    render: (_, row) => {
      if (row.files.length === 0) {
        return <span className="text-xs" style={{ color: "var(--text-3)" }}>Sin archivos</span>;
      }
      if (row.files.length === 1) {
        const f = row.files[0];
        return (
          <a
            href={`/api/files/${f.filename}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--accent)" }}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="truncate max-w-30">{f.originalName}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      }
      return (
        <div
          className="inline-flex items-center gap-1.5 text-xs font-medium"
          style={{ color: "var(--accent)" }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <Files className="h-3.5 w-3.5" />
          <span>{row.files.length} archivos</span>
        </div>
      );
    },
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
