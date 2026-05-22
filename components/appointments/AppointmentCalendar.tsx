"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, isToday,
  addMonths, subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import type { SerializedAppointment } from "./AppointmentsTable";
import type { AppointmentStatus } from "@/types";

const STATUS_COLOR: Record<AppointmentStatus, string> = {
  PENDING:   "var(--warning)",
  CONFIRMED: "var(--info)",
  DONE:      "var(--success)",
  CANCELLED: "var(--danger)",
};

const STATUS_BG: Record<AppointmentStatus, string> = {
  PENDING:   "var(--warning-muted)",
  CONFIRMED: "var(--info-muted)",
  DONE:      "var(--success-muted)",
  CANCELLED: "var(--danger-muted)",
};

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
}

export function AppointmentCalendar({ appointments }: { appointments: SerializedAppointment[] }) {
  const router = useRouter();
  const [current, setCurrent] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [current]);

  const byDay = useMemo(() => {
    const map = new Map<string, SerializedAppointment[]>();
    for (const a of appointments) {
      const key = format(new Date(a.date), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return map;
  }, [appointments]);

  const today = new Date();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrent((d) => subMonths(d, 1))}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-2)" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="text-sm font-semibold capitalize w-36 text-center" style={{ color: "var(--text-1)" }}>
            {format(current, "MMMM yyyy", { locale: es })}
          </h3>
          <button
            onClick={() => setCurrent((d) => addMonths(d, 1))}
            className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
            style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-2)" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => setCurrent(startOfMonth(today))}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-70"
          style={{ border: "1px solid var(--border)", background: "var(--bg-input)", color: "var(--text-2)" }}
        >
          Hoy
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7" style={{ borderBottom: "1px solid var(--border)" }}>
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium"
            style={{ color: "var(--text-3)" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const dayAppts = byDay.get(key) ?? [];
          const isCurrentMonth = isSameMonth(day, current);
          const isCurrentDay = isToday(day);
          const showCount = 3;
          const visible = dayAppts.slice(0, showCount);
          const overflow = dayAppts.length - showCount;

          return (
            <div
              key={key}
              className="min-h-24 p-1.5 flex flex-col gap-1"
              style={{
                borderRight: (i + 1) % 7 === 0 ? "none" : "1px solid var(--border)",
                borderBottom: i < days.length - 7 ? "1px solid var(--border)" : "none",
                background: isCurrentDay ? "var(--accent-light)" : "transparent",
                opacity: isCurrentMonth ? 1 : 0.35,
              }}
            >
              <span
                className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full shrink-0 ${isCurrentDay ? "font-bold" : ""}`}
                style={{
                  color: isCurrentDay ? "var(--accent-foreground)" : "var(--text-2)",
                  background: isCurrentDay ? "var(--accent)" : "transparent",
                  alignSelf: "flex-end",
                }}
              >
                {format(day, "d")}
              </span>

              {visible.map((a) => (
                <button
                  key={a.id}
                  onClick={() => router.push(`/appointments/${a.id}`)}
                  className="w-full text-left rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate transition-opacity hover:opacity-75"
                  style={{
                    background: STATUS_BG[a.status],
                    color: STATUS_COLOR[a.status],
                    borderLeft: `2px solid ${STATUS_COLOR[a.status]}`,
                  }}
                  title={`${a.companyName} — ${formatTime(a.time)}`}
                >
                  <span className="mr-1">{formatTime(a.time)}</span>
                  {a.companyName}
                </button>
              ))}

              {overflow > 0 && (
                <span className="text-[10px] pl-1" style={{ color: "var(--text-3)" }}>
                  +{overflow} más
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
