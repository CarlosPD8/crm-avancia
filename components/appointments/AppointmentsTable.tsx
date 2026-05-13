"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { DeleteAppointmentButton } from "@/app/appointments/DeleteAppointmentButton";
import { formatDate, formatTime } from "@/lib/utils";
import type { AppointmentStatus } from "@/types";

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
};

interface AppointmentsTableProps {
  appointments: SerializedAppointment[];
}

const columns: Column<SerializedAppointment>[] = [
  {
    key: "companyName",
    label: "Empresa",
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-2.5">
        <div
          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 theme-avatar-accent"
        >
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
];

export function AppointmentsTable({ appointments }: AppointmentsTableProps) {
  return (
    <DataTable<SerializedAppointment>
      columns={columns}
      data={appointments}
      emptyIcon={CalendarDays}
      emptyTitle="Sin citas"
      emptyDescription="Crea tu primera cita para empezar."
      actions={(row) => (
        <>
          <Link href={`/appointments/${row.id}`}>
            <Button size="sm" variant="ghost">Editar</Button>
          </Link>
          <DeleteAppointmentButton id={row.id} />
        </>
      )}
    />
  );
}
