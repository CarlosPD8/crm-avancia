import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  href?: string;
  color?: "blue" | "emerald" | "amber" | "red" | "indigo" | "violet";
  className?: string;
}

const colorMap: Record<string, { color: string; light: string; muted: string }> = {
  blue:    { color: "var(--info)",    light: "var(--info-light)",    muted: "var(--info-muted)"    },
  indigo:  { color: "var(--accent)",  light: "var(--accent-light)",  muted: "var(--accent-muted)"  },
  emerald: { color: "var(--success)", light: "var(--success-light)", muted: "var(--success-muted)" },
  amber:   { color: "var(--warning)", light: "var(--warning-light)", muted: "var(--warning-muted)" },
  red:     { color: "var(--danger)",  light: "var(--danger-light)",  muted: "var(--danger-muted)"  },
  violet:  { color: "var(--violet)",  light: "var(--violet-muted)",  muted: "var(--violet-muted)"  },
};

export function MetricCard({
  title, value, icon: Icon, description, href, color = "indigo", className,
}: MetricCardProps) {
  const c = colorMap[color] ?? colorMap.indigo;

  const content = (
    <div
      className={cn(
        "rounded-2xl p-5 flex items-start justify-between gap-4 transition-all duration-150",
        href && "hover:scale-[1.01] cursor-pointer",
        className,
      )}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex flex-col gap-1.5 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
          {title}
        </p>
        <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: "var(--text-1)" }}>
          {value}
        </p>
        {description && (
          <p className="text-xs" style={{ color: "var(--text-3)" }}>{description}</p>
        )}
      </div>
      <div
        className="rounded-xl p-2.5 shrink-0"
        style={{ background: c.light }}
      >
        <Icon className="h-5 w-5" strokeWidth={2} style={{ color: c.color }} />
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
