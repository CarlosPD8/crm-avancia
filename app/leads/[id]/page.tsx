export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
        <div className="flex items-center gap-3 mb-6">
          <Link href="/leads">
            <button
              className="h-9 w-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-2)" }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>
              {isNew ? "Nuevo lead" : "Editar lead"}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
              {isNew
                ? "Completa los datos para registrar un nuevo lead."
                : `Editando lead: ${lead?.companyName}.`}
            </p>
          </div>
        </div>

        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)" }}>
          <LeadForm lead={lead ?? undefined} />
        </div>
      </div>
    </PageContainer>
  );
}
