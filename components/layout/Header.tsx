"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard":       { title: "Dashboard",       description: "Resumen de actividad comercial" },
  "/appointments":    { title: "Citas",            description: "Gestiona tus citas comerciales" },
  "/leads":           { title: "Leads",            description: "Contactos y oportunidades" },
  "/prospect-search": { title: "Buscar Clientes",  description: "Encuentra nuevos clientes potenciales" },
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
      className="sticky top-0 z-30 h-16 flex items-center px-6"
      style={{
        background: "color-mix(in srgb, var(--bg-sidebar) 90%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <h1 className="text-base font-bold leading-none" style={{ color: "var(--text-1)" }}>
          {title}
        </h1>
        {description && (
          <p className="text-xs leading-none mt-1.5" style={{ color: "var(--text-3)" }}>
            {description}
          </p>
        )}
      </div>
    </header>
  );
}
