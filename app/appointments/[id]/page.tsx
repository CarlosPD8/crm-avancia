export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { AppointmentForm } from "@/components/appointments/AppointmentForm";

interface AppointmentPageProps {
  params: Promise<{ id: string }>;
}

export default async function AppointmentPage({ params }: AppointmentPageProps) {
  const { id } = await params;
  const isNew = id === "new";

  const [appointment, users] = await Promise.all([
    isNew ? null : prisma.appointment.findUnique({ where: { id }, include: { assignedUser: true } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!isNew && !appointment) notFound();

  return (
    <PageContainer>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-900">
            {isNew ? "Nueva cita" : "Editar cita"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isNew
              ? "Completa los datos para crear una nueva cita comercial."
              : `Editando cita con ${appointment?.companyName}.`}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <AppointmentForm
            appointment={appointment ?? undefined}
            users={users}
          />
        </div>
      </div>
    </PageContainer>
  );
}
