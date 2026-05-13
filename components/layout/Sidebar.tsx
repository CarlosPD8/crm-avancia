"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, Search, Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ui/ThemeProvider";

const navItems = [
  { href: "/dashboard",       label: "Dashboard",       icon: LayoutDashboard },
  { href: "/appointments",    label: "Citas",           icon: CalendarDays },
  { href: "/leads",           label: "Leads",           icon: Users },
  { href: "/prospect-search", label: "Buscar Clientes", icon: Search },
];

function NavLink({
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
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        isActive
          ? "text-white"
          : "hover:opacity-80",
      )}
      style={
        isActive
          ? { background: "var(--accent)", color: "#fff", boxShadow: "0 4px 12px var(--accent-muted)" }
          : { color: "var(--text-2)", background: "transparent" }
      }
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
      {label}
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
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-2)", boxShadow: "var(--shadow-sm)" }}
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 flex flex-col",
          "transform transition-transform duration-200 ease-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Avancia CRM" width={34} height={34} className="rounded-xl shrink-0" />
            <div>
              <p className="text-sm font-bold tracking-tight leading-none" style={{ color: "var(--text-1)" }}>
                Avancia
              </p>
              <p className="text-[11px] leading-none mt-1 font-medium" style={{ color: "var(--accent)" }}>
                CRM
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

        {/* Nav */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
            Menú
          </p>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: "var(--accent)" }}
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
              className="p-2 rounded-xl transition-all duration-150 shrink-0"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-2)" }}
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
