export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProposalForm } from "@/components/proposals/ProposalForm";

interface ProposalPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { id } = await params;
  const isNew = id === "new";

  const [proposal, leads] = await Promise.all([
    isNew
      ? null
      : prisma.proposal.findUnique({
          where: { id },
          include: { files: { orderBy: { createdAt: "asc" } } },
        }),
    prisma.lead.findMany({
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true, contactName: true, email: true, phone: true },
    }),
  ]);

  if (!isNew && !proposal) notFound();

  const serialized = proposal
    ? {
        ...proposal,
        value: proposal.value,
        sentAt: proposal.sentAt?.toISOString().split("T")[0] ?? null,
        createdAt: proposal.createdAt.toISOString(),
        updatedAt: proposal.updatedAt.toISOString(),
        files: proposal.files.map((f) => ({
          id: f.id,
          filename: f.filename,
          originalName: f.originalName,
          size: f.size,
        })),
      }
    : undefined;

  return (
    <PageContainer>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>
            {isNew ? "Nueva propuesta" : `Editando: ${proposal?.companyName}`}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
            {isNew
              ? "Completa los datos y adjunta los documentos necesarios."
              : "Actualiza la información o gestiona los archivos adjuntos."}
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <ProposalForm proposal={serialized} leads={leads} />
        </div>
      </div>
    </PageContainer>
  );
}
