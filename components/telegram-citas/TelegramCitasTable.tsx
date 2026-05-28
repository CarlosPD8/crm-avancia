"use client";

import { useRouter } from "next/navigation";
import { Bot } from "lucide-react";
import { DataTable, type Column } from "@/components/ui/DataTable";

export type TelegramCita = {
  id: string;
  nombre_cliente: string;
  telefono: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  chat_id_telegram: string;
};

const ESTADO_STYLES: Record<string, { color: string; bg: string }> = {
  confirmada:  { color: "var(--success)", bg: "var(--success-muted)" },
  cancelada:   { color: "var(--danger)",  bg: "var(--danger-muted)" },
  pendiente:   { color: "var(--warning)", bg: "var(--warning-muted)" },
};

function EstadoBadge({ estado }: { estado: string }) {
  const style = ESTADO_STYLES[estado] ?? { color: "var(--text-3)", bg: "var(--bg-elevated)" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize"
      style={{ color: style.color, background: style.bg }}
    >
      {estado}
    </span>
  );
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-ES", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
  });
}

function formatHora(hora: string) {
  return String(hora).slice(0, 5);
}

const columns: Column<TelegramCita>[] = [
  {
    key: "nombre_cliente",
    label: "Cliente",
    sortable: true,
    render: (val, row) => (
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 theme-avatar-accent">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="font-medium text-sm" style={{ color: "var(--text-1)" }}>{String(val)}</p>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{row.telefono}</p>
        </div>
      </div>
    ),
  },
  {
    key: "fecha",
    label: "Fecha",
    sortable: true,
    render: (val) => (
      <span className="text-sm" style={{ color: "var(--text-2)" }}>{formatFecha(String(val))}</span>
    ),
  },
  {
    key: "hora_inicio",
    label: "Hora",
    render: (val, row) => (
      <span className="text-sm tabular-nums" style={{ color: "var(--text-2)" }}>
        {formatHora(String(val))} – {formatHora(row.hora_fin)}
      </span>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    render: (val) => <EstadoBadge estado={String(val)} />,
  },
  {
    key: "chat_id_telegram",
    label: "Chat ID",
    render: (val) => (
      <span className="text-xs font-mono" style={{ color: "var(--text-3)" }}>{String(val)}</span>
    ),
  },
];

export function TelegramCitasTable({ citas }: { citas: TelegramCita[] }) {
  const router = useRouter();
  return (
    <DataTable<TelegramCita>
      columns={columns}
      data={citas}
      emptyIcon={Bot}
      emptyTitle="Sin citas de Telegram"
      emptyDescription="Las citas agendadas por el bot de Telegram aparecerán aquí."
      onRowDoubleClick={() => {}}
    />
  );
}
