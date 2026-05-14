"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, Search, FileText,
  Menu, X, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";

const navItems = [
  { href: "/dashboard",       label: "Dashboard",  icon: LayoutDashboard },
  { href: "/appointments",    label: "Citas",      icon: CalendarDays },
  { href: "/leads",           label: "Leads",      icon: Users },
  { href: "/proposals",       label: "Propuestas", icon: FileText },
  { href: "/prospect-search", label: "Búsqueda",   icon: Search },
];

function GridNavItem({
  href, label, icon: Icon, onClick,
}: {
  href: string; label: string; icon: typeof LayoutDashboard; onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl transition-all duration-150 text-center"
      style={
        isActive
          ? { background: "var(--nav-active-bg)", color: "var(--nav-active-text)" }
          : { color: "var(--text-2)" }
      }
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.75} />
      <span className="text-[11px] font-semibold leading-tight">{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-xl transition-colors"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          color: "var(--text-2)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-60 flex flex-col",
          "transform transition-transform duration-200 ease-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: "var(--nav-active-bg)" }}
            >
              <Image src="/logo.png" alt="Avancia" width={26} height={26} />
            </div>
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: "var(--text-1)" }}>
                Avancia
              </p>
              <p className="text-[11px] font-semibold leading-none mt-1" style={{ color: "var(--text-3)" }}>
                CRM Panel
              </p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg"
            style={{ color: "var(--text-3)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 mb-4" style={{ height: "1px", background: "var(--border)" }} />

        {/* Nav grid */}
        <nav className="flex-1 px-4 overflow-y-auto">
          <p
            className="px-1 mb-3 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--text-3)" }}
          >
            Menú
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <GridNavItem
                key={item.href}
                {...item}
                onClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-4 py-5" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: "var(--nav-active-bg)", color: "var(--nav-active-text)" }}
              >
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-1)" }}>
                  Admin
                </p>
                <p className="text-[10px] truncate" style={{ color: "var(--text-3)" }}>
                  Avancia Tech
                </p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="p-2 rounded-xl transition-all duration-150 shrink-0"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
              }}
              title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              {theme === "dark"
                ? <Sun className="h-3.5 w-3.5" />
                : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
