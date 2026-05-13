"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { proposalSchema } from "@/lib/validators/proposal.schema";
import type { ActionResult } from "@/types";
import { unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export async function createProposal(data: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = proposalSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { sentAt, value, leadId, ...rest } = parsed.data;

  const proposal = await prisma.proposal.create({
    data: {
      ...rest,
      value: value ?? null,
      leadId: leadId || null,
      sentAt: sentAt ? new Date(sentAt) : null,
    },
  });

  revalidatePath("/proposals");
  return { success: true, data: { id: proposal.id } };
}

export async function updateProposal(id: string, data: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = proposalSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { sentAt, value, leadId, ...rest } = parsed.data;

  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      ...rest,
      value: value ?? null,
      leadId: leadId || null,
      sentAt: sentAt ? new Date(sentAt) : null,
    },
  });

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposal.id}`);
  return { success: true, data: { id: proposal.id } };
}

export async function deleteProposal(id: string): Promise<ActionResult> {
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) return { success: false, error: "No encontrado" };

  if (proposal.pdfPath) {
    try {
      await unlink(path.join(UPLOAD_DIR, path.basename(proposal.pdfPath)));
    } catch {
      // File already gone — continue
    }
  }

  await prisma.proposal.delete({ where: { id } });
  revalidatePath("/proposals");
  return { success: true, data: undefined };
}
