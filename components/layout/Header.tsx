"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard":       { title: "Dashboard",        description: "Vista general del negocio" },
  "/appointments":    { title: "Citas",             description: "Gestión de reuniones comerciales" },
  "/telegram-citas":  { title: "Citas Telegram",    description: "Reservas del bot automático" },
  "/leads":           { title: "Leads",             description: "Pipeline de clientes potenciales" },
  "/proposals":       { title: "Propuestas",        description: "Gestión de presupuestos" },
  "/invoices":        { title: "Facturas",          description: "Control de facturación" },
  "/prospect-search": { title: "Buscar Clientes",   description: "Prospección de nuevos clientes" },
};

function getPageInfo(pathname: string) {
  const exact = pageTitles[pathname];
  if (exact) return exact;
  const parent = Object.keys(pageTitles).find((k) => pathname.startsWith(k + "/"));
  return parent ? pageTitles[parent] : { title: "CRM Avancia", description: "" };
}

export function Header() {
  const pathname = usePathname();
  const { title, description } = getPageInfo(pathname);

  return (
    <header
      className="sticky top-0 z-30 flex items-center px-6 gap-4"
      style={{
        height: "56px",
        background: "color-mix(in srgb, var(--bg-sidebar) 92%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <nav className="flex items-center gap-1.5 text-xs font-medium shrink-0">
          <span style={{ color: "var(--text-3)" }}>Inicio</span>
          <ChevronRight className="h-3 w-3 shrink-0" style={{ color: "var(--text-3)" }} />
          <span className="font-semibold" style={{ color: "var(--text-1)" }}>{title}</span>
        </nav>
        {description && (
          <>
            <span style={{ color: "var(--border-strong)" }} className="text-xs hidden sm:inline">·</span>
            <span className="text-xs hidden sm:inline truncate" style={{ color: "var(--text-3)" }}>{description}</span>
          </>
        )}
      </div>
    </header>
  );
}
