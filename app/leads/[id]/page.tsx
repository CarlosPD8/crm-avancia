export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageContainer } from "@/components/layout/PageContainer";
import { LeadForm } from "@/components/leads/LeadForm";

interface LeadPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadPage({ params }: LeadPageProps) {
  const { id } = await params;
  const isNew = id === "new";

  const lead = isNew ? null : await prisma.lead.findUnique({ where: { id } });

  if (!isNew && !lead) notFound();

  return (
    <PageContainer>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-slate-900">
            {isNew ? "Nuevo lead" : "Editar lead"}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {isNew
              ? "Completa los datos para registrar un nuevo lead."
              : `Editando lead: ${lead?.companyName}.`}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <LeadForm lead={lead ?? undefined} />
        </div>
      </div>
    </PageContainer>
  );
}
