"use client";

import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProspectSearchForm } from "@/components/prospect-search/ProspectSearchForm";
import { ProspectResultsTable } from "@/components/prospect-search/ProspectResultsTable";
import type { ProspectResult } from "@/types";

export default function ProspectSearchPage() {
  const [results, setResults] = useState<ProspectResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleResults = (data: ProspectResult[]) => {
    setError(null);
    setResults(data);
  };

  const handleError = (msg: string) => {
    setError(msg);
    setResults([]);
  };

  return (
    <PageContainer>
      <div className="mb-2">
        <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>Buscar clientes potenciales</h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>
          Encuentra nuevas oportunidades y conviértelas en leads con un clic.
        </p>
      </div>

      <ProspectSearchForm onResults={handleResults} onError={handleError} />

      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "var(--danger-muted)", border: "1px solid var(--danger-light)", color: "var(--danger)" }}
        >
          <span className="font-medium">Error: </span>{error}
        </div>
      )}

      <ProspectResultsTable results={results} />
    </PageContainer>
  );
}
