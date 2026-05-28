"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, Search, FileText,
  Receipt, Bot, Menu, X, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/components/ui/ThemeProvider";

const navItems = [
  { href: "/dashboard",       label: "Dashboard",  icon: LayoutDashboard },
  { href: "/appointments",    label: "Citas",      icon: CalendarDays },
  { href: "/telegram-citas",  label: "Telegram",   icon: Bot },
  { href: "/leads",           label: "Leads",      icon: Users },
  { href: "/proposals",       label: "Propuestas", icon: FileText },
  { href: "/invoices",        label: "Facturas",   icon: Receipt },
  { href: "/prospect-search", label: "Búsqueda",   icon: Search },
];

function NavItem({
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
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative"
      style={
        isActive
          ? {
              background: "var(--nav-active-bg)",
              color: "var(--nav-active-text)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }
          : { color: "var(--text-2)" }
      }
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
        if (!isActive) (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }
      }}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
      <span className="text-sm font-medium">{label}</span>
      {isActive && (
        <span
          className="absolute right-3 h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--nav-active-text)", opacity: 0.6 }}
        />
      )}
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
          "fixed inset-y-0 left-0 z-50 w-56 flex flex-col",
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
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: "var(--nav-active-bg)" }}
            >
              <Image src="/logo.png" alt="Avancia" width={22} height={22} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold leading-none truncate" style={{ color: "var(--text-1)" }}>
                Avancia
              </p>
              <p className="text-[10px] font-medium leading-none mt-1" style={{ color: "var(--text-3)" }}>
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
        <div className="mx-4 mb-3" style={{ height: "1px", background: "var(--border)" }} />

        {/* Nav */}
        <nav className="flex-1 px-3 overflow-y-auto space-y-0.5">
          <p
            className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest"
            style={{ color: "var(--text-3)" }}
          >
            Menú
          </p>
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: "var(--nav-active-bg)", color: "var(--nav-active-text)" }}
              >
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-1)" }}>Admin</p>
                <p className="text-[10px] truncate" style={{ color: "var(--text-3)" }}>Avancia Tech</p>
              </div>
            </div>
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg transition-all duration-150 shrink-0"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
              }}
              title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
