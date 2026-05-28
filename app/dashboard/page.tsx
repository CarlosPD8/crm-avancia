export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek } from "@/lib/utils";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { LatestLeads } from "@/components/dashboard/LatestLeads";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppointmentsBarChart, RevenueAreaChart, LeadsFunnelChart } from "@/components/dashboard/DashboardCharts";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const todayEnd = getEndOfDay(now);
  const weekStart = getStartOfWeek(now);
  const weekEnd = getEndOfWeek(now);

  const [
    todayAppointments,
    weekAppointments,
    newLeads,
    pendingLeads,
    upcomingAppointments,
    latestLeads,
    invoiceAggregates,
    overdueCount,
    weeklyAppts,
    leadsByStatus,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.appointment.count({ where: { date: { gte: todayStart, lte: todayEnd } } }),
    prisma.appointment.count({ where: { date: { gte: weekStart, lte: weekEnd } } }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: { in: ["NEW", "CONTACTED"] } } }),
    prisma.appointment.findMany({
      where: { date: { gte: now }, status: { not: "CANCELLED" } },
      orderBy: { date: "asc" },
      take: 6,
      include: { assignedUser: true },
    }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.invoice.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true, paidAmount: true },
    }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    // Appointments per day this week
    prisma.appointment.findMany({
      where: { date: { gte: weekStart, lte: weekEnd } },
      select: { date: true },
    }),
    // Leads by status
    prisma.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    // Invoices last 6 months
    prisma.invoice.findMany({
      where: {
        status: { not: "CANCELLED" },
        issueDate: { gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
      },
      select: { issueDate: true, total: true, paidAmount: true },
    }),
  ]);

  const totalFacturado = invoiceAggregates._sum.total ?? 0;
  const totalCobrado = invoiceAggregates._sum.paidAmount ?? 0;
  const totalPendiente = Math.max(0, totalFacturado - totalCobrado);

  // Build weekly chart data (Mon–Sun)
  const weekDayMap: Record<number, number> = {};
  weeklyAppts.forEach((a) => {
    const d = new Date(a.date).getDay();
    weekDayMap[d] = (weekDayMap[d] ?? 0) + 1;
  });
  const weekChartData = [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    day: DIAS[d],
    citas: weekDayMap[d] ?? 0,
  }));

  // Build leads funnel
  const STATUS_LABELS: Record<string, string> = {
    NEW: "Nuevo", CONTACTED: "Contactado", QUALIFIED: "Cualificado",
    CONVERTED: "Convertido", DISCARDED: "Descartado",
  };
  const STATUS_COLORS: Record<string, string> = {
    NEW: "var(--info)", CONTACTED: "var(--accent)", QUALIFIED: "var(--success)",
    CONVERTED: "var(--success)", DISCARDED: "var(--danger)",
  };
  const leadsChartData = leadsByStatus.map((l) => ({
    estado: STATUS_LABELS[l.status] ?? l.status,
    cantidad: l._count._all,
    color: STATUS_COLORS[l.status] ?? "var(--text-3)",
  }));

  // Build monthly revenue chart
  const monthMap: Record<string, { facturado: number; cobrado: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = MESES[d.getMonth()];
    monthMap[key] = { facturado: 0, cobrado: 0 };
  }
  monthlyRevenue.forEach((inv) => {
    const key = MESES[new Date(inv.issueDate).getMonth()];
    if (monthMap[key]) {
      monthMap[key].facturado += inv.total;
      monthMap[key].cobrado += inv.paidAmount;
    }
  });
  const revenueChartData = Object.entries(monthMap).map(([mes, v]) => ({
    mes,
    facturado: Math.round(v.facturado),
    cobrado: Math.round(v.cobrado),
  }));

  return (
    <PageContainer>
      <DashboardGreeting />
      <MetricsGrid
        todayAppointments={todayAppointments}
        weekAppointments={weekAppointments}
        newLeads={newLeads}
        pendingLeads={pendingLeads}
        totalFacturado={totalFacturado}
        totalCobrado={totalCobrado}
        totalPendiente={totalPendiente}
        overdueInvoices={overdueCount}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AppointmentsBarChart data={weekChartData} />
        <RevenueAreaChart data={revenueChartData} />
        <LeadsFunnelChart data={leadsChartData} />
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UpcomingAppointments appointments={upcomingAppointments} />
        <LatestLeads leads={latestLeads} />
      </div>
    </PageContainer>
  );
}
