"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { proposalSchema } from "@/lib/validators/proposal.schema";
import type { ActionResult } from "@/types";
import { unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

type FileInput = { filename: string; originalName: string; size: number };

async function deleteFiles(files: { filename: string }[]) {
  await Promise.allSettled(
    files.map((f) => unlink(path.join(UPLOAD_DIR, path.basename(f.filename))).catch(() => {})),
  );
}

export async function createProposal(
  data: unknown,
  newFiles: FileInput[] = [],
): Promise<ActionResult<{ id: string }>> {
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
      files: newFiles.length > 0
        ? { create: newFiles.map((f) => ({ filename: f.filename, originalName: f.originalName, size: f.size })) }
        : undefined,
    },
  });

  revalidatePath("/proposals");
  return { success: true, data: { id: proposal.id } };
}

export async function updateProposal(
  id: string,
  data: unknown,
  newFiles: FileInput[] = [],
  removedFileIds: string[] = [],
): Promise<ActionResult<{ id: string }>> {
  const parsed = proposalSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { sentAt, value, leadId, ...rest } = parsed.data;

  // Get files to delete from disk before removing DB records
  let filesToDelete: { filename: string }[] = [];
  if (removedFileIds.length > 0) {
    filesToDelete = await prisma.proposalFile.findMany({
      where: { id: { in: removedFileIds } },
      select: { filename: true },
    });
  }

  const proposal = await prisma.proposal.update({
    where: { id },
    data: {
      ...rest,
      value: value ?? null,
      leadId: leadId || null,
      sentAt: sentAt ? new Date(sentAt) : null,
      files: {
        ...(removedFileIds.length > 0 ? { deleteMany: { id: { in: removedFileIds } } } : {}),
        ...(newFiles.length > 0
          ? { create: newFiles.map((f) => ({ filename: f.filename, originalName: f.originalName, size: f.size })) }
          : {}),
      },
    },
  });

  await deleteFiles(filesToDelete);

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposal.id}`);
  return { success: true, data: { id: proposal.id } };
}

export async function deleteProposal(id: string): Promise<ActionResult> {
  const files = await prisma.proposalFile.findMany({
    where: { proposalId: id },
    select: { filename: true },
  });

  await prisma.proposal.delete({ where: { id } }); // cascade deletes ProposalFile rows
  await deleteFiles(files);

  revalidatePath("/proposals");
  return { success: true, data: undefined };
}
