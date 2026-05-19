export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { AppointmentsTable } from "@/components/appointments/AppointmentsTable";
import type { AppointmentStatus } from "@/types";

interface AppointmentsPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status as AppointmentStatus;
  if (params.from || params.to) {
    where.date = {
      ...(params.from ? { gte: new Date(params.from) } : {}),
      ...(params.to ? { lte: new Date(params.to) } : {}),
    };
  }
  if (params.q) {
    where.OR = [
      { companyName: { contains: params.q, mode: "insensitive" } },
      { contactName: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: { date: "asc" },
    include: { assignedUser: true, files: { orderBy: { createdAt: "asc" } } },
  });

  // Serialize Dates → strings before passing to Client Component
  const serialized = appointments.map((a) => ({
    ...a,
    date: a.date.toISOString(),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    assignedUser: a.assignedUser
      ? { id: a.assignedUser.id, name: a.assignedUser.name }
      : null,
    files: a.files.map((f) => ({ id: f.id, filename: f.filename, originalName: f.originalName, size: f.size })),
  }));

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>Citas comerciales</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{appointments.length} citas en total</p>
        </div>
        <Link href="/appointments/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nueva cita
          </Button>
        </Link>
      </div>

      <AppointmentFilters />
      <AppointmentsTable appointments={serialized} />
    </PageContainer>
  );
}
