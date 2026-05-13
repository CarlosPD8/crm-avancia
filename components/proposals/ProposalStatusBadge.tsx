import { cn } from "@/lib/utils";
import type { ProposalStatus } from "@prisma/client";

const config: Record<ProposalStatus, { label: string; color: string; bg: string }> = {
  DRAFT:       { label: "Borrador",   color: "var(--text-3)",  bg: "var(--bg-elevated)"   },
  SENT:        { label: "Enviado",    color: "var(--info)",    bg: "var(--info-muted)"    },
  NEGOTIATING: { label: "Negociando", color: "var(--warning)", bg: "var(--warning-muted)" },
  ACCEPTED:    { label: "Aceptado",   color: "var(--success)", bg: "var(--success-muted)" },
  REJECTED:    { label: "Rechazado",  color: "var(--danger)",  bg: "var(--danger-muted)"  },
};

export function ProposalStatusBadge({ status, className }: { status: ProposalStatus; className?: string }) {
  const cfg = config[status];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", className)}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}
