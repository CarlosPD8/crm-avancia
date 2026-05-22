export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getStartOfDay, getEndOfDay, getStartOfWeek, getEndOfWeek } from "@/lib/utils";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { LatestLeads } from "@/components/dashboard/LatestLeads";
import { PageContainer } from "@/components/layout/PageContainer";

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
  ] = await Promise.all([
    prisma.appointment.count({
      where: { date: { gte: todayStart, lte: todayEnd } },
    }),
    prisma.appointment.count({
      where: { date: { gte: weekStart, lte: weekEnd } },
    }),
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.lead.count({ where: { status: { in: ["NEW", "CONTACTED"] } } }),
    prisma.appointment.findMany({
      where: {
        date: { gte: now },
        status: { not: "CANCELLED" },
      },
      orderBy: { date: "asc" },
      take: 6,
      include: { assignedUser: true },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.invoice.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true, paidAmount: true },
    }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
  ]);

  const totalFacturado = invoiceAggregates._sum.total ?? 0;
  const totalCobrado = invoiceAggregates._sum.paidAmount ?? 0;
  const totalPendiente = Math.max(0, totalFacturado - totalCobrado);

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
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UpcomingAppointments appointments={upcomingAppointments} />
        <LatestLeads leads={latestLeads} />
      </div>
    </PageContainer>
  );
}
