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
  animationDelay?: number;
}

const colorMap: Record<string, { color: string; light: string; muted: string; gradient: string }> = {
  blue:    { color: "var(--info)",    light: "var(--info-light)",    muted: "var(--info-muted)",    gradient: "rgba(37,99,235,0.7)"   },
  indigo:  { color: "var(--accent)",  light: "var(--accent-light)",  muted: "var(--accent-muted)",  gradient: "rgba(201,149,10,0.7)"  },
  emerald: { color: "var(--success)", light: "var(--success-light)", muted: "var(--success-muted)", gradient: "rgba(22,163,74,0.7)"   },
  amber:   { color: "var(--warning)", light: "var(--warning-light)", muted: "var(--warning-muted)", gradient: "rgba(217,119,6,0.7)"   },
  red:     { color: "var(--danger)",  light: "var(--danger-light)",  muted: "var(--danger-muted)",  gradient: "rgba(220,38,38,0.7)"   },
  violet:  { color: "var(--violet)",  light: "var(--violet-muted)",  muted: "var(--violet-muted)",  gradient: "rgba(124,58,237,0.7)"  },
};

export function MetricCard({
  title, value, icon: Icon, description, href, color = "indigo", className, animationDelay = 0,
}: MetricCardProps) {
  const c = colorMap[color] ?? colorMap.indigo;

  const content = (
    <div
      className={cn(
        "rounded-2xl overflow-hidden flex flex-col justify-between gap-5 transition-all duration-200 animate-fade-in-up",
        href && "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer",
        className,
      )}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        animationDelay: `${animationDelay}ms`,
        position: "relative",
        paddingTop: "4px",
      }}
    >
      {/* Top color strip */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${c.color}, ${c.gradient})`,
          opacity: 0.8,
        }}
      />

      <div className="px-5 pt-4 flex items-start justify-between gap-3">
        {/* Icon */}
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: c.muted }}
        >
          <Icon className="h-4.5 w-4.5" strokeWidth={2} style={{ color: c.color }} />
        </div>

        {/* Value */}
        <p
          className="text-2xl font-bold tabular-nums tracking-tight leading-none"
          style={{ color: "var(--text-1)" }}
        >
          {value}
        </p>
      </div>

      <div className="px-5 pb-4">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: c.color }}>
          {title}
        </p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{description}</p>
        )}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
