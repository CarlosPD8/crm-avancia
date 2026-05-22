"use client";

import { useState } from "react";
import { List, CalendarDays } from "lucide-react";
import { AppointmentsTable, type SerializedAppointment } from "./AppointmentsTable";
import { AppointmentCalendar } from "./AppointmentCalendar";

export function AppointmentsViewClient({ appointments }: { appointments: SerializedAppointment[] }) {
  const [view, setView] = useState<"table" | "calendar">("table");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div
          className="flex items-center rounded-xl p-0.5 gap-0.5"
          style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setView("table")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: view === "table" ? "var(--bg-card)" : "transparent",
              color: view === "table" ? "var(--text-1)" : "var(--text-3)",
              boxShadow: view === "table" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <List className="h-3.5 w-3.5" />
            Lista
          </button>
          <button
            onClick={() => setView("calendar")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: view === "calendar" ? "var(--bg-card)" : "transparent",
              color: view === "calendar" ? "var(--text-1)" : "var(--text-3)",
              boxShadow: view === "calendar" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Calendario
          </button>
        </div>
      </div>

      {view === "table"
        ? <AppointmentsTable appointments={appointments} />
        : <AppointmentCalendar appointments={appointments} />
      }
    </div>
  );
}
