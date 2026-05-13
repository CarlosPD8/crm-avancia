"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validators/lead.schema";
import type { ActionResult } from "@/types";
import type { Lead, LeadStatus, LeadSource } from "@prisma/client";

export async function getLeads(filters?: {
  status?: LeadStatus;
  industry?: string;
  source?: LeadSource;
  q?: string;
}): Promise<Lead[]> {
  const where: Record<string, unknown> = {};

  if (filters?.status) where.status = filters.status;
  if (filters?.industry) where.industry = { contains: filters.industry, mode: "insensitive" };
  if (filters?.source) where.source = filters.source;
  if (filters?.q) {
    where.OR = [
      { companyName: { contains: filters.q, mode: "insensitive" } },
      { contactName: { contains: filters.q, mode: "insensitive" } },
      { email: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  return prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function getLeadById(id: string): Promise<Lead | null> {
  return prisma.lead.findUnique({ where: { id } });
}

export async function createLead(
  formData: unknown
): Promise<ActionResult<{ id: string }>> {
  const parsed = leadSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { phone, website, notes, ...rest } = parsed.data;
    const lead = await prisma.lead.create({
      data: {
        ...rest,
        phone: phone || null,
        website: website || null,
        notes: notes || null,
      },
    });
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { success: true, data: { id: lead.id } };
  } catch {
    return { success: false, error: "Error al crear el lead. Inténtalo de nuevo." };
  }
}

export async function updateLead(
  id: string,
  formData: unknown
): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const { phone, website, notes, ...rest } = parsed.data;
    await prisma.lead.update({
      where: { id },
      data: {
        ...rest,
        phone: phone || null,
        website: website || null,
        notes: notes || null,
      },
    });
    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al actualizar el lead." };
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    await prisma.lead.delete({ where: { id } });
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al eliminar el lead." };
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<ActionResult> {
  try {
    await prisma.lead.update({ where: { id }, data: { status } });
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al actualizar el estado." };
  }
}
