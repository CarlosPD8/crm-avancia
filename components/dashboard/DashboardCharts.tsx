"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from "recharts";

/* ─── Custom Tooltip ─── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs font-semibold"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-strong)",
        color: "var(--text-1)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <p style={{ color: "var(--text-3)" }} className="mb-0.5">{label}</p>
      <p>{payload[0].value}</p>
    </div>
  );
}

/* ─── Appointments Bar Chart ─── */
type DayData = { day: string; citas: number };

export function AppointmentsBarChart({ data }: { data: DayData[] }) {
  return (
    <div
      className="rounded-2xl p-5 animate-fade-in-up"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", animationDelay: "200ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>Citas esta semana</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Distribución por día</p>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
        >
          {data.reduce((s, d) => s + d.citas, 0)} total
        </span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={28} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-3)", fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-elevated)", radius: 8 }} />
          <Bar dataKey="citas" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Revenue Area Chart ─── */
type MonthData = { mes: string; facturado: number; cobrado: number };

export function RevenueAreaChart({ data }: { data: MonthData[] }) {
  return (
    <div
      className="rounded-2xl p-5 animate-fade-in-up"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", animationDelay: "280ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>Facturación</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
            <span className="text-[10px] font-semibold" style={{ color: "var(--text-3)" }}>Facturado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--success)" }} />
            <span className="text-[10px] font-semibold" style={{ color: "var(--text-3)" }}>Cobrado</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "var(--text-3)", fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="facturado" stroke="var(--accent)" strokeWidth={2} fill="url(#areaGradient1)" dot={false} />
          <Area type="monotone" dataKey="cobrado" stroke="var(--success)" strokeWidth={2} fill="url(#areaGradient2)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Leads Funnel Bar Chart ─── */
type LeadStatusData = { estado: string; cantidad: number; color: string };

export function LeadsFunnelChart({ data }: { data: LeadStatusData[] }) {
  return (
    <div
      className="rounded-2xl p-5 animate-fade-in-up"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", animationDelay: "360ms" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--text-1)" }}>Pipeline de Leads</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Por estado</p>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: "var(--success-muted)", color: "var(--success)" }}
        >
          {data.reduce((s, d) => s + d.cantidad, 0)} leads
        </span>
      </div>
      <div className="space-y-3">
        {data.map((item) => {
          const max = Math.max(...data.map((d) => d.cantidad), 1);
          const pct = (item.cantidad / max) * 100;
          return (
            <div key={item.estado}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>{item.estado}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: "var(--text-1)" }}>{item.cantidad}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-elevated)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
