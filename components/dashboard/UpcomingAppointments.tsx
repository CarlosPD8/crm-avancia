import Link from "next/link";
import { CalendarDays, ArrowRight, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatTime } from "@/lib/utils";
import type { AppointmentWithUser } from "@/types";

interface UpcomingAppointmentsProps {
  appointments: AppointmentWithUser[];
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" style={{ color: "var(--text-3)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Próximas citas</h2>
        </div>
        <Link
          href="/appointments"
          className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--accent)" }}
        >
          Ver todas
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Sin citas próximas"
          description="No hay citas programadas."
        />
      ) : (
        <div className="theme-divide">
          {appointments.map((apt) => (
            <Link
              key={apt.id}
              href={`/appointments/${apt.id}`}
              className="flex items-center justify-between px-5 py-3.5 theme-row-hover transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-avatar-accent">
                  <span className="text-xs font-semibold">{apt.companyName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                    {apt.companyName}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
                    {apt.contactName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium" style={{ color: "var(--text-1)" }}>
                    {formatDate(apt.date)}
                  </p>
                  <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-3)" }}>
                    <Clock className="h-3 w-3" />
                    {formatTime(apt.time)}
                  </div>
                </div>
                <StatusBadge status={apt.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
