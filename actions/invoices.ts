"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { invoiceSchema, paymentSchema } from "@/lib/validators/invoice.schema";
import type { ActionResult } from "@/types";

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { number: { startsWith: `INV-${year}-` } },
  });
  return `INV-${year}-${String(count + 1).padStart(3, "0")}`;
}

function calcTotals(
  items: { quantity: number; unitPrice: number }[],
  taxRate: number,
  discountAmount: number,
) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discounted = Math.max(0, subtotal - discountAmount);
  const taxAmount = discounted * (taxRate / 100);
  const total = discounted + taxAmount;
  return { subtotal, taxAmount, total };
}

function resolveStatus(
  current: string,
  total: number,
  paidAmount: number,
  dueDate: Date,
): "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED" {
  if (current === "CANCELLED") return "CANCELLED";
  if (paidAmount >= total && total > 0) return "PAID";
  if (paidAmount > 0) return "PARTIAL";
  if (current === "SENT" && dueDate < new Date()) return "OVERDUE";
  if (dueDate < new Date() && current === "DRAFT") return "DRAFT";
  return current as "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
}

export async function createInvoice(rawData: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = invoiceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const number = await generateInvoiceNumber();
  const { subtotal, taxAmount, total } = calcTotals(data.items, data.taxRate, data.discountAmount);
  const dueDate = new Date(data.dueDate);

  const invoice = await prisma.invoice.create({
    data: {
      number,
      companyName: data.companyName,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone ?? null,
      address: data.address ?? null,
      taxId: data.taxId ?? null,
      leadId: data.leadId || null,
      proposalId: data.proposalId || null,
      taxRate: data.taxRate,
      discountAmount: data.discountAmount,
      subtotal,
      taxAmount,
      total,
      paidAmount: 0,
      issueDate: new Date(data.issueDate),
      dueDate,
      status: "DRAFT",
      isRecurring: data.isRecurring,
      recurringPeriod: data.recurringPeriod ?? null,
      notes: data.notes ?? null,
      items: {
        create: data.items.map((item, i) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          position: i,
        })),
      },
    },
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true, data: { id: invoice.id } };
}

export async function updateInvoice(id: string, rawData: unknown): Promise<ActionResult> {
  const parsed = invoiceSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Datos inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Factura no encontrada" };

  const { subtotal, taxAmount, total } = calcTotals(data.items, data.taxRate, data.discountAmount);
  const dueDate = new Date(data.dueDate);
  const status = resolveStatus(existing.status, total, existing.paidAmount, dueDate);

  await prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await tx.invoice.update({
      where: { id },
      data: {
        companyName: data.companyName,
        contactName: data.contactName,
        email: data.email,
        phone: data.phone ?? null,
        address: data.address ?? null,
        taxId: data.taxId ?? null,
        leadId: data.leadId || null,
        proposalId: data.proposalId || null,
        taxRate: data.taxRate,
        discountAmount: data.discountAmount,
        subtotal,
        taxAmount,
        total,
        issueDate: new Date(data.issueDate),
        dueDate,
        status,
        isRecurring: data.isRecurring,
        recurringPeriod: data.recurringPeriod ?? null,
        notes: data.notes ?? null,
        items: {
          create: data.items.map((item, i) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
            position: i,
          })),
        },
      },
    });
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function deleteInvoice(id: string): Promise<ActionResult> {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function markInvoiceSent(id: string): Promise<ActionResult> {
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) return { success: false, error: "Factura no encontrada" };

  await prisma.invoice.update({
    where: { id },
    data: {
      status: invoice.dueDate < new Date() ? "OVERDUE" : "SENT",
      sentAt: new Date(),
    },
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return { success: true, data: undefined };
}

export async function cancelInvoice(id: string): Promise<ActionResult> {
  await prisma.invoice.update({ where: { id }, data: { status: "CANCELLED" } });
  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
  return { success: true, data: undefined };
}

export async function registerPayment(invoiceId: string, rawData: unknown): Promise<ActionResult> {
  const parsed = paymentSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: "Datos de pago inválidos", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return { success: false, error: "Factura no encontrada" };

  const newPaid = invoice.paidAmount + data.amount;
  const status = resolveStatus("SENT", invoice.total, newPaid, invoice.dueDate);

  await prisma.$transaction([
    prisma.invoicePayment.create({
      data: {
        invoiceId,
        amount: data.amount,
        method: data.method,
        date: new Date(data.date),
        notes: data.notes ?? null,
      },
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: { paidAmount: newPaid, status },
    }),
  ]);

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}

export async function syncOverdueInvoices(): Promise<void> {
  await prisma.invoice.updateMany({
    where: {
      status: "SENT",
      dueDate: { lt: new Date() },
    },
    data: { status: "OVERDUE" },
  });
}
