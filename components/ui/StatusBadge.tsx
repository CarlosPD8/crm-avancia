import { cn } from "@/lib/utils";
import { appointmentStatusLabels, leadStatusLabels } from "@/lib/utils";
import type { AppointmentStatus, LeadStatus } from "@prisma/client";

type StatusValue = AppointmentStatus | LeadStatus;

interface StatusBadgeProps {
  status: StatusValue;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<StatusValue, { label: string; className: string }> = {
  // Appointment statuses
  PENDING: { label: appointmentStatusLabels.PENDING, className: "bg-amber-50 text-amber-700 border-amber-200" },
  CONFIRMED: { label: appointmentStatusLabels.CONFIRMED, className: "bg-blue-50 text-blue-700 border-blue-200" },
  DONE: { label: appointmentStatusLabels.DONE, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: appointmentStatusLabels.CANCELLED, className: "bg-red-50 text-red-600 border-red-200" },
  // Lead statuses
  NEW: { label: leadStatusLabels.NEW, className: "bg-amber-50 text-amber-700 border-amber-200" },
  CONTACTED: { label: leadStatusLabels.CONTACTED, className: "bg-blue-50 text-blue-700 border-blue-200" },
  QUALIFIED: { label: leadStatusLabels.QUALIFIED, className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DISCARDED: { label: leadStatusLabels.DISCARDED, className: "bg-red-50 text-red-600 border-red-200" },
  CONVERTED: { label: leadStatusLabels.CONVERTED, className: "bg-violet-50 text-violet-700 border-violet-200" },
};

export function StatusBadge({ status, size = "sm", className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.className,
        className
      )}
    >
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", {
        "bg-amber-500": status === "PENDING" || status === "NEW",
        "bg-blue-500": status === "CONFIRMED" || status === "CONTACTED",
        "bg-emerald-500": status === "DONE" || status === "QUALIFIED",
        "bg-red-500": status === "CANCELLED" || status === "DISCARDED",
        "bg-violet-500": status === "CONVERTED",
      })} />
      {config.label}
    </span>
  );
}
