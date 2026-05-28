import { CalendarDays, Users, Clock, TrendingUp, Receipt, Banknote, AlertCircle, CheckCircle2 } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";

function formatEur(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k €`;
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

interface MetricsGridProps {
  todayAppointments: number;
  weekAppointments: number;
  newLeads: number;
  pendingLeads: number;
  totalFacturado: number;
  totalCobrado: number;
  totalPendiente: number;
  overdueInvoices: number;
}

export function MetricsGrid({
  todayAppointments, weekAppointments, newLeads, pendingLeads,
  totalFacturado, totalCobrado, totalPendiente, overdueInvoices,
}: MetricsGridProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <MetricCard title="Citas hoy"          value={todayAppointments} icon={CalendarDays} description="Programadas para hoy"   href="/appointments"          color="indigo"  animationDelay={0}   />
        <MetricCard title="Citas esta semana"  value={weekAppointments}  icon={Clock}        description="Total de la semana"     href="/appointments"          color="blue"    animationDelay={60}  />
        <MetricCard title="Leads nuevos"       value={newLeads}          icon={TrendingUp}   description="Sin contactar aún"      href="/leads"                 color="emerald" animationDelay={120} />
        <MetricCard title="Leads pendientes"   value={pendingLeads}      icon={Users}        description="Nuevo o contactado"     href="/leads"                 color="amber"   animationDelay={180} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <MetricCard title="Total facturado"    value={formatEur(totalFacturado)}  icon={Receipt}       description="Facturas no canceladas" href="/invoices"              color="indigo"  animationDelay={240} />
        <MetricCard title="Total cobrado"      value={formatEur(totalCobrado)}    icon={CheckCircle2}  description="Pagos registrados"      href="/invoices?status=PAID"  color="emerald" animationDelay={300} />
        <MetricCard title="Pendiente de cobro" value={formatEur(totalPendiente)}  icon={Banknote}      description="Importe por cobrar"     href="/invoices?status=SENT"  color="amber"   animationDelay={360} />
        <MetricCard title="Facturas vencidas"  value={overdueInvoices}            icon={AlertCircle}   description="Requieren atención"     href="/invoices?status=OVERDUE" color="red"   animationDelay={420} />
      </div>
    </div>
  );
}
