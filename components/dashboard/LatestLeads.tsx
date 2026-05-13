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
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900">Últimos leads</h2>
        </div>
        <Link
          href="/leads"
          className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
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
        <div className="divide-y divide-slate-50">
          {leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <span className="text-xs font-semibold text-slate-600">
                    {lead.companyName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{lead.companyName}</p>
                  <p className="text-xs text-slate-400 truncate">{lead.industry}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-xs text-slate-400 hidden sm:block">
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
