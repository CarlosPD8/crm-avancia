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
  trend?: { value: number; label: string };
}

const colorMap: Record<string, { color: string; muted: string; gradient: string }> = {
  blue:    { color: "var(--info)",    muted: "var(--info-muted)",    gradient: "linear-gradient(135deg, #3b82f6, #60a5fa)" },
  indigo:  { color: "var(--accent)",  muted: "var(--accent-muted)",  gradient: "var(--accent-gradient)" },
  emerald: { color: "var(--success)", muted: "var(--success-muted)", gradient: "linear-gradient(135deg, #10b981, #34d399)" },
  amber:   { color: "var(--warning)", muted: "var(--warning-muted)", gradient: "linear-gradient(135deg, #f59e0b, #fbbf24)" },
  red:     { color: "var(--danger)",  muted: "var(--danger-muted)",  gradient: "linear-gradient(135deg, #ef4444, #f87171)" },
  violet:  { color: "var(--violet)",  muted: "var(--violet-muted)",  gradient: "linear-gradient(135deg, #8b5cf6, #a78bfa)" },
};

export function MetricCard({
  title, value, icon: Icon, description, href, color = "indigo", className, animationDelay = 0, trend,
}: MetricCardProps) {
  const c = colorMap[color] ?? colorMap.indigo;

  const content = (
    <div
      className={cn(
        "rounded-2xl p-5 flex flex-col gap-3 animate-fade-in-up relative overflow-hidden transition-all duration-200",
        href && "hover:-translate-y-0.5 cursor-pointer",
        className,
      )}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-card)",
        animationDelay: `${animationDelay}ms`,
      }}
    >
      {/* Subtle gradient orb in corner */}
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: c.gradient,
          opacity: 0.08,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: c.gradient, boxShadow: `0 4px 12px ${c.muted}` }}
        >
          <Icon className="h-4.5 w-4.5 text-white" strokeWidth={2} />
        </div>
        {trend && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              color: trend.value >= 0 ? "var(--success)" : "var(--danger)",
              background: trend.value >= 0 ? "var(--success-muted)" : "var(--danger-muted)",
            }}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-bold tabular-nums tracking-tight leading-none" style={{ color: "var(--text-1)" }}>
          {value}
        </p>
      </div>

      {/* Label */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
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
