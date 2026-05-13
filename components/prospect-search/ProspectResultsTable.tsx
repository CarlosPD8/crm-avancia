"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, BookmarkPlus, Check, UserSearch, UserCheck } from "lucide-react";
import { saveProspectAsLead, enrichProspectContact } from "@/actions/prospect-search";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ProspectResult } from "@/types";
import { Search } from "lucide-react";

interface ContactData {
  name: string;
  email: string;
  position: string;
}

interface ProspectResultsTableProps {
  results: ProspectResult[];
  isLoading?: boolean;
}

export function ProspectResultsTable({ results, isLoading }: ProspectResultsTableProps) {
  const router = useRouter();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Record<string, ContactData>>({});
  const [enrichErrors, setEnrichErrors] = useState<Record<string, string>>({});
  const [, startTransition] = useTransition();

  const handleSave = (prospect: ProspectResult) => {
    const enriched = contacts[prospect.id];
    const enrichedProspect: ProspectResult = enriched
      ? { ...prospect, contactName: enriched.name, email: enriched.email, contactPosition: enriched.position }
      : prospect;

    setPendingSaveId(prospect.id);
    startTransition(async () => {
      const result = await saveProspectAsLead(enrichedProspect);
      if (result.success) {
        setSavedIds((prev) => new Set(prev).add(prospect.id));
        router.refresh();
      }
      setPendingSaveId(null);
    });
  };

  const handleEnrich = (prospect: ProspectResult) => {
    if (!prospect.website) return;
    setEnrichingId(prospect.id);
    setEnrichErrors((prev) => { const next = { ...prev }; delete next[prospect.id]; return next; });
    startTransition(async () => {
      const result = await enrichProspectContact(prospect.website);
      if (result.success) {
        setContacts((prev) => ({ ...prev, [prospect.id]: result.data }));
      } else {
        setEnrichErrors((prev) => ({ ...prev, [prospect.id]: result.error }));
      }
      setEnrichingId(null);
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm py-16">
        <LoadingSpinner size="lg" />
        <p className="text-center text-sm text-slate-400 mt-3">Buscando clientes potenciales...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <EmptyState
          icon={Search}
          title="Sin resultados todavía"
          description="Introduce los parámetros de búsqueda y pulsa 'Buscar clientes' para encontrar potenciales clientes."
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Resultados</h2>
          <p className="text-xs text-slate-400 mt-0.5">{results.length} clientes potenciales encontrados</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
            Google Places
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
            Hunter.io
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Contacto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Teléfono</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Ubicación</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Web</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {results.map((prospect) => {
              const isSaved = savedIds.has(prospect.id);
              const isSavePending = pendingSaveId === prospect.id;
              const isEnriching = enrichingId === prospect.id;
              const contact = contacts[prospect.id];
              const enrichError = enrichErrors[prospect.id];
              const hasContact = !!contact;

              return (
                <tr key={prospect.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-indigo-600">
                          {prospect.companyName.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-slate-900 whitespace-nowrap">{prospect.companyName}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {hasContact ? (
                      <div>
                        <p className="text-slate-700 font-medium flex items-center gap-1">
                          <UserCheck className="h-3 w-3 text-blue-500 shrink-0" />
                          {contact.name || "—"}
                        </p>
                        {contact.position && (
                          <p className="text-xs text-slate-400 ml-4">{contact.position}</p>
                        )}
                      </div>
                    ) : prospect.website ? (
                      <div>
                        <button
                          onClick={() => handleEnrich(prospect)}
                          disabled={isEnriching}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isEnriching ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <UserSearch className="h-3.5 w-3.5" />
                          )}
                          {isEnriching ? "Buscando..." : "Buscar contacto"}
                        </button>
                        {enrichError && (
                          <p className="text-xs text-slate-400 mt-0.5">Sin datos</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300 italic text-xs">Sin web</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {hasContact && contact.email ? (
                      <span className="text-slate-600">{contact.email}</span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-slate-600 hidden md:table-cell whitespace-nowrap">
                    {prospect.phone || <span className="text-slate-300">—</span>}
                  </td>

                  <td className="px-4 py-3.5 text-slate-500 hidden lg:table-cell text-xs max-w-xs truncate">
                    {prospect.location}
                  </td>

                  <td className="px-4 py-3.5">
                    {prospect.website ? (
                      <a
                        href={prospect.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Web
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {isSaved ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <Check className="h-3.5 w-3.5" />
                        Guardado
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={isSavePending}
                        onClick={() => handleSave(prospect)}
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        Guardar como lead
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
        <p className="text-xs text-slate-400">{results.length} resultados · Pulsa <span className="font-medium text-slate-500">Buscar contacto</span> para consultar Hunter.io (1 crédito por empresa)</p>
      </div>
    </div>
  );
}
