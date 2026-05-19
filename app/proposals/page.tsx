export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { ProposalsTable } from "@/components/proposals/ProposalsTable";

export default async function ProposalsPage() {
  const proposals = await prisma.proposal.findMany({
    orderBy: { createdAt: "desc" },
    include: { files: { orderBy: { createdAt: "asc" } } },
  });

  const serialized = proposals.map((p) => ({
    id: p.id,
    companyName: p.companyName,
    contactName: p.contactName,
    email: p.email,
    status: p.status,
    value: p.value,
    files: p.files.map((f) => ({ id: f.id, filename: f.filename, originalName: f.originalName, size: f.size })),
    sentAt: p.sentAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>
            Propuestas
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
            {proposals.length} {proposals.length === 1 ? "propuesta" : "propuestas"} en total
          </p>
        </div>
        <Link href="/proposals/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nueva propuesta
          </Button>
        </Link>
      </div>

      <ProposalsTable proposals={serialized} />
    </PageContainer>
  );
}
