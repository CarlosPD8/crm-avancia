"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/dashboard": { title: "Dashboard", description: "Resumen de actividad" },
  "/appointments": { title: "Citas", description: "Gestiona tus citas comerciales" },
  "/leads": { title: "Leads", description: "Gestiona tus contactos y oportunidades" },
  "/prospect-search": { title: "Buscar Clientes", description: "Encuentra nuevos clientes potenciales" },
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
    <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-6">
      <div>
        <h1 className="text-sm font-semibold text-slate-900">{title}</h1>
        {description && <p className="text-xs text-slate-400 leading-none mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
