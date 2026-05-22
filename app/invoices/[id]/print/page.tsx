import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PrintInvoice } from "@/components/invoices/PrintInvoice";

interface Props { params: Promise<{ id: string }> }

export default async function PrintPage({ params }: Props) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: { orderBy: { position: "asc" } }, payments: { orderBy: { date: "asc" } } },
  });
  if (!invoice) notFound();

  return (
    <PrintInvoice
      invoice={{
        ...invoice,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        sentAt: invoice.sentAt?.toISOString() ?? null,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        payments: invoice.payments.map((p) => ({ ...p, date: p.date.toISOString(), createdAt: p.createdAt.toISOString() })),
      }}
    />
  );
}
