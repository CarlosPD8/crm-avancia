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
    <div className="space-y-4">
      {/* Citas y leads */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          title="Citas hoy"
          value={todayAppointments}
          icon={CalendarDays}
          description="Programadas para hoy"
          href="/appointments"
          color="indigo"
        />
        <MetricCard
          title="Citas esta semana"
          value={weekAppointments}
          icon={Clock}
          description="Total de la semana"
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

      {/* Facturación */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          title="Total facturado"
          value={formatEur(totalFacturado)}
          icon={Receipt}
          description="Facturas no canceladas"
          href="/invoices"
          color="indigo"
        />
        <MetricCard
          title="Total cobrado"
          value={formatEur(totalCobrado)}
          icon={CheckCircle2}
          description="Pagos registrados"
          href="/invoices?status=PAID"
          color="emerald"
        />
        <MetricCard
          title="Pendiente de cobro"
          value={formatEur(totalPendiente)}
          icon={Banknote}
          description="Importe por cobrar"
          href="/invoices?status=SENT"
          color="amber"
        />
        <MetricCard
          title="Facturas vencidas"
          value={overdueInvoices}
          icon={AlertCircle}
          description="Requieren atención"
          href="/invoices?status=OVERDUE"
          color="red"
        />
      </div>
    </div>
  );
}
