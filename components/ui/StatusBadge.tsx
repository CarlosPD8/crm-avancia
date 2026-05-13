import { cn } from "@/lib/utils";
import { appointmentStatusLabels, leadStatusLabels } from "@/lib/utils";
import type { AppointmentStatus, LeadStatus } from "@prisma/client";

type StatusValue = AppointmentStatus | LeadStatus;

const statusConfig: Record<StatusValue, { label: string; color: string; bg: string }> = {
  PENDING:   { label: appointmentStatusLabels.PENDING,   color: "var(--warning)",  bg: "var(--warning-muted)"  },
  CONFIRMED: { label: appointmentStatusLabels.CONFIRMED, color: "var(--info)",     bg: "var(--info-muted)"     },
  DONE:      { label: appointmentStatusLabels.DONE,      color: "var(--success)",  bg: "var(--success-muted)"  },
  CANCELLED: { label: appointmentStatusLabels.CANCELLED, color: "var(--danger)",   bg: "var(--danger-muted)"   },
  NEW:       { label: leadStatusLabels.NEW,       color: "var(--warning)",  bg: "var(--warning-muted)"  },
  CONTACTED: { label: leadStatusLabels.CONTACTED, color: "var(--info)",     bg: "var(--info-muted)"     },
  QUALIFIED: { label: leadStatusLabels.QUALIFIED, color: "var(--success)",  bg: "var(--success-muted)"  },
  DISCARDED: { label: leadStatusLabels.DISCARDED, color: "var(--danger)",   bg: "var(--danger-muted)"   },
  CONVERTED: { label: leadStatusLabels.CONVERTED, color: "var(--violet)",   bg: "var(--violet-muted)"   },
};

interface StatusBadgeProps {
  status: StatusValue;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}
