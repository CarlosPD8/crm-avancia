"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { DeleteLeadButton } from "@/app/leads/DeleteLeadButton";
import { formatCreatedAt, getLeadSourceLabel } from "@/lib/utils";
import type { LeadStatus, LeadSource } from "@/types";

export type SerializedLead = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  industry: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

interface LeadsTableProps {
  leads: SerializedLead[];
}

const columns: Column<SerializedLead>[] = [
  {
    key: "companyName",
    label: "Empresa",
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 theme-avatar-neutral">
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
    key: "email",
    label: "Email",
    render: (val) => <span style={{ color: "var(--text-2)" }}>{String(val)}</span>,
  },
  {
    key: "phone",
    label: "Teléfono",
    render: (val) => <span style={{ color: "var(--text-2)" }}>{val ? String(val) : "—"}</span>,
  },
  {
    key: "industry",
    label: "Sector",
    sortable: true,
    render: (val) => (
      <span className="theme-tag">{String(val)}</span>
    ),
  },
  {
    key: "source",
    label: "Fuente",
    render: (val) => (
      <span className="text-xs" style={{ color: "var(--text-3)" }}>{getLeadSourceLabel(val as LeadSource)}</span>
    ),
  },
  {
    key: "status",
    label: "Estado",
    render: (val) => <StatusBadge status={val as LeadStatus} />,
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

export function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <DataTable<SerializedLead>
      columns={columns}
      data={leads}
      emptyIcon={Users}
      emptyTitle="Sin leads"
      emptyDescription="Crea tu primer lead o búscalo en el módulo de prospección."
      actions={(row) => (
        <>
          <Link href={`/leads/${row.id}`}>
            <Button size="sm" variant="ghost">Editar</Button>
          </Link>
          <DeleteLeadButton id={row.id} />
        </>
      )}
    />
  );
}
