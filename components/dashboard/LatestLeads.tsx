import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCreatedAt } from "@/lib/utils";
import type { Lead } from "@/types";

interface LatestLeadsProps {
  leads: Lead[];
}

export function LatestLeads({ leads }: LatestLeadsProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" style={{ color: "var(--text-3)" }} />
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Últimos leads</h2>
        </div>
        <Link
          href="/leads"
          className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--accent)" }}
        >
          Ver todos
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {leads.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin leads todavía"
          description="Los leads aparecerán aquí cuando los crees."
        />
      ) : (
        <div className="theme-divide">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center justify-between px-5 py-3.5 theme-row-hover transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg theme-avatar-neutral">
                  <span className="text-xs font-semibold">{lead.companyName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-1)" }}>
                    {lead.companyName}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-3)" }}>
                    {lead.industry}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs hidden sm:block" style={{ color: "var(--text-3)" }}>
                  {formatCreatedAt(lead.createdAt)}
                </span>
                <StatusBadge status={lead.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
