import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@prisma/client";

const config: Record<InvoiceStatus, { label: string; color: string; bg: string }> = {
  DRAFT:     { label: "Borrador",  color: "var(--text-3)",   bg: "var(--bg-elevated)"    },
  SENT:      { label: "Enviada",   color: "var(--info)",     bg: "var(--info-muted)"     },
  PARTIAL:   { label: "Parcial",   color: "var(--warning)",  bg: "var(--warning-muted)"  },
  PAID:      { label: "Pagada",    color: "var(--success)",  bg: "var(--success-muted)"  },
  OVERDUE:   { label: "Vencida",   color: "var(--danger)",   bg: "var(--danger-muted)"   },
  CANCELLED: { label: "Cancelada", color: "var(--text-3)",   bg: "var(--bg-elevated)"    },
};

export function InvoiceStatusBadge({
  status, size = "sm", className,
}: {
  status: InvoiceStatus; size?: "sm" | "md"; className?: string;
}) {
  const c = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
      style={{ background: c.bg, color: c.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: c.color }} />
      {c.label}
    </span>
  );
}
