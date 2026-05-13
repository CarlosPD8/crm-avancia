"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, BookmarkPlus, Check, UserSearch, UserCheck, Search } from "lucide-react";
import { saveProspectAsLead, enrichProspectContact } from "@/actions/prospect-search";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ProspectResult } from "@/types";

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

  const cardStyle = {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-card)",
    borderRadius: "1rem",
  };

  if (isLoading) {
    return (
      <div className="py-16" style={cardStyle}>
        <LoadingSpinner size="lg" />
        <p className="text-center text-sm mt-3" style={{ color: "var(--text-3)" }}>
          Buscando clientes potenciales...
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={cardStyle}>
        <EmptyState
          icon={Search}
          title="Sin resultados todavía"
          description="Introduce los parámetros de búsqueda y pulsa 'Buscar clientes' para encontrar potenciales clientes."
        />
      </div>
    );
  }

  return (
    <div style={{ ...cardStyle, overflow: "hidden" }}>
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>Resultados</h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            {results.length} clientes potenciales encontrados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="theme-tag-success">● Google Places</span>
          <span className="theme-tag-info">Hunter.io</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
              {["Empresa", "Contacto", "Email", "Teléfono", "Ubicación", "Web", "Acciones"].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap${
                    h === "Teléfono" ? " hidden md:table-cell" : h === "Ubicación" ? " hidden lg:table-cell" : ""
                  }${i === 6 ? " text-right" : ""}`}
                  style={{ color: "var(--text-3)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((prospect) => {
              const isSaved = savedIds.has(prospect.id);
              const isSavePending = pendingSaveId === prospect.id;
              const isEnriching = enrichingId === prospect.id;
              const contact = contacts[prospect.id];
              const enrichError = enrichErrors[prospect.id];
              const hasContact = !!contact;

              return (
                <tr
                  key={prospect.id}
                  style={{ borderTop: "1px solid var(--border)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  className="transition-colors duration-100"
                >
                  {/* Empresa */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 theme-avatar-accent">
                        <span className="text-xs font-semibold">{prospect.companyName.charAt(0)}</span>
                      </div>
                      <span className="font-medium whitespace-nowrap" style={{ color: "var(--text-1)" }}>
                        {prospect.companyName}
                      </span>
                    </div>
                  </td>

                  {/* Contacto */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {hasContact ? (
                      <div>
                        <p className="font-medium flex items-center gap-1" style={{ color: "var(--text-1)" }}>
                          <UserCheck className="h-3 w-3 shrink-0" style={{ color: "var(--info)" }} />
                          {contact.name || "—"}
                        </p>
                        {contact.position && (
                          <p className="text-xs ml-4" style={{ color: "var(--text-3)" }}>{contact.position}</p>
                        )}
                      </div>
                    ) : prospect.website ? (
                      <div>
                        <button
                          onClick={() => handleEnrich(prospect)}
                          disabled={isEnriching}
                          className="inline-flex items-center gap-1 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-70"
                          style={{ color: "var(--accent)" }}
                        >
                          {isEnriching ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <UserSearch className="h-3.5 w-3.5" />
                          )}
                          {isEnriching ? "Buscando..." : "Buscar contacto"}
                        </button>
                        {enrichError && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>Sin datos</p>
                        )}
                      </div>
                    ) : (
                      <span className="italic text-xs" style={{ color: "var(--text-3)" }}>Sin web</span>
                    )}
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    {hasContact && contact.email ? (
                      <span style={{ color: "var(--text-2)" }}>{contact.email}</span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>—</span>
                    )}
                  </td>

                  {/* Teléfono */}
                  <td className="px-4 py-3.5 hidden md:table-cell whitespace-nowrap" style={{ color: "var(--text-2)" }}>
                    {prospect.phone || <span style={{ color: "var(--text-3)" }}>—</span>}
                  </td>

                  {/* Ubicación */}
                  <td className="px-4 py-3.5 hidden lg:table-cell text-xs max-w-xs truncate" style={{ color: "var(--text-2)" }}>
                    {prospect.location}
                  </td>

                  {/* Web */}
                  <td className="px-4 py-3.5">
                    {prospect.website ? (
                      <a
                        href={prospect.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-xs font-medium transition-opacity hover:opacity-70"
                        style={{ color: "var(--accent)" }}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Web
                      </a>
                    ) : (
                      <span style={{ color: "var(--text-3)" }}>—</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3.5 text-right">
                    {isSaved ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--success)" }}>
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

      {/* Footer */}
      <div className="px-4 py-3 flex items-center" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          {results.length} resultados · Pulsa{" "}
          <span className="font-medium" style={{ color: "var(--text-2)" }}>Buscar contacto</span>{" "}
          para consultar Hunter.io (1 crédito por empresa)
        </p>
      </div>
    </div>
  );
}
