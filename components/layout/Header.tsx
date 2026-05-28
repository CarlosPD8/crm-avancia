"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard":       { title: "Dashboard",       description: "Vista general" },
  "/appointments":    { title: "Citas",            description: "Reuniones comerciales" },
  "/telegram-citas":  { title: "Citas Telegram",   description: "Bot automático" },
  "/leads":           { title: "Leads",            description: "Pipeline comercial" },
  "/proposals":       { title: "Propuestas",       description: "Presupuestos" },
  "/invoices":        { title: "Facturas",         description: "Facturación" },
  "/prospect-search": { title: "Buscar Clientes",  description: "Prospección" },
};

function getPageInfo(pathname: string) {
  const exact = pageTitles[pathname];
  if (exact) return exact;
  const parent = Object.keys(pageTitles).find((k) => pathname.startsWith(k + "/"));
  return parent ? pageTitles[parent] : { title: "CRM Avancia", description: "" };
}

export function Header() {
  const pathname = usePathname();
  const { setOpen } = useSidebar();
  const { title, description } = getPageInfo(pathname);

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6"
      style={{
        height: "56px",
        background: "color-mix(in srgb, var(--bg-sidebar) 92%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Mobile hamburger — only on small screens */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 -ml-1 rounded-xl shrink-0 transition-colors"
        style={{ color: "var(--text-2)", background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
        aria-label="Abrir menú"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="font-bold text-sm truncate" style={{ color: "var(--text-1)" }}>{title}</span>
        {description && (
          <>
            <span className="hidden sm:inline" style={{ color: "var(--border-strong)" }}>·</span>
            <span className="hidden sm:inline text-xs truncate" style={{ color: "var(--text-3)" }}>{description}</span>
          </>
        )}
      </div>
    </header>
  );
}
