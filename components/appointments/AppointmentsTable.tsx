"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, FileText, ExternalLink, Files } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { DeleteAppointmentButton } from "@/app/appointments/DeleteAppointmentButton";
import { formatDate, formatTime } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

type AppointmentFile = { id: string; filename: string; originalName: string; size: number };

export type SerializedAppointment = {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  assignedUser: { id: string; name: string } | null;
  files: AppointmentFile[];
};

const columns: Column<SerializedAppointment>[] = [
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
    key: "date",
    label: "Fecha",
    sortable: true,
    render: (val) => (
      <span className="font-medium" style={{ color: "var(--text-1)" }}>{formatDate(String(val))}</span>
    ),
  },
  {
    key: "time",
    label: "Hora",
    render: (val) => <span style={{ color: "var(--text-2)" }}>{formatTime(String(val))}</span>,
  },
  {
    key: "status",
    label: "Estado",
    render: (val) => <StatusBadge status={val as AppointmentStatus} />,
  },
  {
    key: "assignedUser",
    label: "Responsable",
    render: (_, row) => (
      <span style={{ color: "var(--text-2)" }}>{row.assignedUser?.name ?? "—"}</span>
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
];

export function AppointmentsTable({ appointments }: { appointments: SerializedAppointment[] }) {
  const router = useRouter();
  return (
    <DataTable<SerializedAppointment>
      columns={columns}
      data={appointments}
      emptyIcon={CalendarDays}
      emptyTitle="Sin citas"
      emptyDescription="Crea tu primera cita para empezar."
      onRowDoubleClick={(row) => router.push(`/appointments/${row.id}`)}
      actions={(row) => <DeleteAppointmentButton id={row.id} />}
    />
  );
}
