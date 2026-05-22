export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    isNew
      ? null
      : prisma.appointment.findUnique({
          where: { id },
          include: {
            assignedUser: true,
            files: { orderBy: { createdAt: "asc" } },
          },
        }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!isNew && !appointment) notFound();

  const serialized = appointment
    ? {
        ...appointment,
        date: appointment.date,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        files: appointment.files.map((f) => ({
          id: f.id,
          filename: f.filename,
          originalName: f.originalName,
          size: f.size,
        })),
      }
    : undefined;

  return (
    <PageContainer>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/appointments">
            <button
              className="h-9 w-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-2)" }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>
              {isNew ? "Nueva cita" : "Editar cita"}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
              {isNew
                ? "Completa los datos para crear una nueva cita comercial."
                : `Editando cita con ${appointment?.companyName}.`}
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <AppointmentForm appointment={serialized ?? undefined} users={users} />
        </div>
      </div>
    </PageContainer>
  );
}
