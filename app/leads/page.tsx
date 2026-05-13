export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadsTable } from "@/components/leads/LeadsTable";
import type { LeadStatus, LeadSource } from "@/types";

interface LeadsPageProps {
  searchParams: Promise<{
    status?: string;
    source?: string;
    industry?: string;
    q?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams;

  const where: Record<string, unknown> = {};
  if (params.status) where.status = params.status as LeadStatus;
  if (params.source) where.source = params.source as LeadSource;
  if (params.industry) where.industry = { contains: params.industry, mode: "insensitive" };
  if (params.q) {
    where.OR = [
      { companyName: { contains: params.q, mode: "insensitive" } },
      { contactName: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Serialize Dates → strings before passing to Client Component
  const serialized = leads.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>Leads</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{leads.length} leads en total</p>
        </div>
        <Link href="/leads/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo lead
          </Button>
        </Link>
      </div>

      <LeadFilters />
      <LeadsTable leads={serialized} />
    </PageContainer>
  );
}
