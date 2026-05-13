import { CalendarDays, Users, Clock, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";

interface MetricsGridProps {
  todayAppointments: number;
  weekAppointments: number;
  newLeads: number;
  pendingLeads: number;
}

export function MetricsGrid({
  todayAppointments,
  weekAppointments,
  newLeads,
  pendingLeads,
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Citas hoy"
        value={todayAppointments}
        icon={CalendarDays}
        description="Citas programadas para hoy"
        href="/appointments"
        color="indigo"
      />
      <MetricCard
        title="Citas esta semana"
        value={weekAppointments}
        icon={Clock}
        description="Total de la semana en curso"
        href="/appointments"
        color="blue"
      />
      <MetricCard
        title="Leads nuevos"
        value={newLeads}
        icon={TrendingUp}
        description="Sin contactar aún"
        href="/leads"
        color="emerald"
      />
      <MetricCard
        title="Leads pendientes"
        value={pendingLeads}
        icon={Users}
        description="Nuevo o contactado"
        href="/leads"
        color="amber"
      />
    </div>
  );
}
