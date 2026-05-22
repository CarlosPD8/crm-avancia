export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { InvoicesTable } from "@/components/invoices/InvoicesTable";
import { syncOverdueInvoices } from "@/actions/invoices";
import type { InvoiceStatus } from "@prisma/client";

interface InvoicesPageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  await syncOverdueInvoices();

  const params = await searchParams;
  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status as InvoiceStatus;
  if (params.q) {
    where.OR = [
      { companyName: { contains: params.q, mode: "insensitive" } },
      { contactName: { contains: params.q, mode: "insensitive" } },
      { number: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const serialized = invoices.map((inv) => ({
    ...inv,
    issueDate: inv.issueDate.toISOString(),
    dueDate: inv.dueDate.toISOString(),
    sentAt: inv.sentAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
    updatedAt: inv.updatedAt.toISOString(),
  }));

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>Facturas</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{invoices.length} facturas en total</p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nueva factura
          </Button>
        </Link>
      </div>

      <InvoiceFilters />
      <InvoicesTable invoices={serialized} />
    </PageContainer>
  );
}
