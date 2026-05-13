import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      {Icon && (
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "var(--bg-elevated)" }}
        >
          <Icon className="h-6 w-6" strokeWidth={1.5} style={{ color: "var(--text-3)" }} />
        </div>
      )}
      <h3 className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>{title}</h3>
      {description && (
        <p className="mt-1 text-sm max-w-sm" style={{ color: "var(--text-2)" }}>{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <a href={action.href}>
              <Button size="sm">{action.label}</Button>
            </a>
          ) : (
            <Button size="sm" onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  );
}
