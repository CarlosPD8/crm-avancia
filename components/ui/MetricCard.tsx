import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  href?: string;
  color?: "indigo" | "emerald" | "amber" | "blue";
  className?: string;
}

const colorMap = {
  indigo: { icon: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
  emerald: { icon: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  amber: { icon: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  blue: { icon: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  href,
  color = "indigo",
  className,
}: MetricCardProps) {
  const colors = colorMap[color];

  const content = (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-100 p-5 shadow-sm",
        "flex items-start justify-between gap-4",
        href && "hover:border-slate-200 hover:shadow-md transition-all duration-150 cursor-pointer",
        className
      )}
    >
      <div className="flex flex-col gap-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 tabular-nums">{value}</p>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className={cn("rounded-lg p-2.5 shrink-0", colors.bg)}>
        <Icon className={cn("h-5 w-5", colors.icon)} strokeWidth={1.75} />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
