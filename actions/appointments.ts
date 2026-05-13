"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validators/appointment.schema";
import type { ActionResult, AppointmentWithUser } from "@/types";
import type { AppointmentStatus } from "@prisma/client";

export async function getAppointments(filters?: {
  status?: AppointmentStatus;
  assignedTo?: string;
  from?: string;
  to?: string;
  q?: string;
}): Promise<AppointmentWithUser[]> {
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.assignedTo) where.assignedTo = filters.assignedTo;
  if (filters?.from || filters?.to) {
    where.date = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }
  if (filters?.q) {
    where.OR = [
      { companyName: { contains: filters.q, mode: "insensitive" } },
      { contactName: { contains: filters.q, mode: "insensitive" } },
      { email: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.appointment.findMany({
    where,
    orderBy: { date: "asc" },
    include: { assignedUser: true },
  });
}

export async function getAppointmentById(id: string): Promise<AppointmentWithUser | null> {
  return prisma.appointment.findUnique({
    where: { id },
    include: { assignedUser: true },
  });
}

export async function createAppointment(
  formData: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = appointmentSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { assignedTo, phone, notes, ...rest } = parsed.data;
    const appointment = await prisma.appointment.create({
      data: {
        ...rest,
        phone: phone || null,
        notes: notes || null,
        assignedTo: assignedTo || null,
      },
    });
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    return { success: true, data: { id: appointment.id } };
  } catch {
    return { success: false, error: "Error al crear la cita. Inténtalo de nuevo." };
  }
}

export async function updateAppointment(
  id: string,
  formData: unknown
): Promise<ActionResult> {
  const parsed = appointmentSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { assignedTo, phone, notes, ...rest } = parsed.data;
    await prisma.appointment.update({
      where: { id },
      data: {
        ...rest,
        phone: phone || null,
        notes: notes || null,
        assignedTo: assignedTo || null,
      },
    });
    revalidatePath("/appointments");
    revalidatePath(`/appointments/${id}`);
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al actualizar la cita." };
  }
}

export async function deleteAppointment(id: string): Promise<ActionResult> {
  try {
    await prisma.appointment.delete({ where: { id } });
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al eliminar la cita." };
  }
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<ActionResult> {
  try {
    await prisma.appointment.update({ where: { id }, data: { status } });
    revalidatePath("/appointments");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al actualizar el estado." };
  }
}
