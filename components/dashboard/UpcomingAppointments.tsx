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
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Próximas citas</h2>
        </div>
        <Link
          href="/appointments"
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
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
        <div className="divide-y divide-slate-50">
          {appointments.map((apt) => (
            <Link
              key={apt.id}
              href={`/appointments/${apt.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <span className="text-xs font-semibold text-indigo-700">
                    {apt.companyName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{apt.companyName}</p>
                  <p className="text-xs text-slate-400 truncate">{apt.contactName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium text-slate-700">{formatDate(apt.date)}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
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
