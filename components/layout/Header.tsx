"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const pageTitles: Record<string, { title: string }> = {
  "/dashboard":       { title: "Dashboard" },
  "/appointments":    { title: "Citas" },
  "/leads":           { title: "Leads" },
  "/prospect-search": { title: "Buscar Clientes" },
  "/proposals":       { title: "Propuestas" },
};

function getPageInfo(pathname: string) {
  const exact = pageTitles[pathname];
  if (exact) return exact;
  const parent = Object.keys(pageTitles).find((k) => pathname.startsWith(k + "/"));
  return parent ? pageTitles[parent] : { title: "CRM Avancia" };
}

export function Header() {
  const pathname = usePathname();
  const { title } = getPageInfo(pathname);

  return (
    <header
      className="sticky top-0 z-30 h-12 flex items-center px-6"
      style={{
        background: "color-mix(in srgb, var(--bg-sidebar) 90%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <nav className="flex items-center gap-1.5 text-xs font-medium">
        <span style={{ color: "var(--text-3)" }}>Inicio</span>
        <ChevronRight className="h-3 w-3 shrink-0" style={{ color: "var(--text-3)" }} />
        <span style={{ color: "var(--text-1)" }}>{title}</span>
      </nav>
    </header>
  );
}
