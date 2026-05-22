export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { InvoiceDetail } from "@/components/invoices/InvoiceDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: Props) {
  const { id } = await params;
  const isNew = id === "new";

  const [invoice, leads, proposals] = await Promise.all([
    isNew ? null : prisma.invoice.findUnique({
      where: { id },
      include: {
        items: { orderBy: { position: "asc" } },
        payments: { orderBy: { date: "asc" } },
        lead: { select: { id: true, companyName: true } },
        proposal: { select: { id: true, companyName: true } },
      },
    }),
    prisma.lead.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: "asc" } }),
    prisma.proposal.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: "asc" } }),
  ]);

  if (!isNew && !invoice) notFound();

  const serializedInvoice = invoice
    ? {
        ...invoice,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        sentAt: invoice.sentAt?.toISOString() ?? null,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        payments: invoice.payments.map((p) => ({
          ...p,
          date: p.date.toISOString(),
          createdAt: p.createdAt.toISOString(),
        })),
      }
    : null;

  return (
    <PageContainer>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/invoices">
            <button
              className="h-9 w-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-2)" }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>
              {isNew ? "Nueva factura" : `Factura ${invoice!.number}`}
            </h2>
            {!isNew && (
              <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{invoice!.companyName}</p>
            )}
          </div>
        </div>
        {!isNew && (
          <a href={`/invoices/${id}/print`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">
              <Printer className="h-4 w-4" />
              Ver PDF
            </Button>
          </a>
        )}
      </div>

      {isNew
        ? <InvoiceForm leads={leads} proposals={proposals} />
        : <InvoiceDetail invoice={serializedInvoice!} leads={leads} proposals={proposals} />
      }
    </PageContainer>
  );
}
