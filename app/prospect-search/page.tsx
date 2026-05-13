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
        <h2 className="text-base font-semibold text-slate-900">Buscar clientes potenciales</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Encuentra nuevas oportunidades y conviértelas en leads con un clic.
        </p>
      </div>

      <ProspectSearchForm onResults={handleResults} onError={handleError} />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
          <span className="font-medium">Error: </span>{error}
        </div>
      )}

      <ProspectResultsTable results={results} />
    </PageContainer>
  );
}
