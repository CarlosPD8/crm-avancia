"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const styles: Record<string, React.CSSProperties> = {
      primary:   { background: "var(--accent)",      color: "#fff",            border: "1px solid transparent", boxShadow: "0 4px 12px var(--accent-muted)" },
      secondary: { background: "var(--bg-elevated)", color: "var(--text-1)",   border: "1px solid var(--border)" },
      danger:    { background: "var(--danger)",      color: "#fff",            border: "1px solid transparent" },
      ghost:     { background: "transparent",        color: "var(--text-2)",   border: "1px solid transparent" },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={styles[variant]}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-xl",
          "transition-all duration-150 cursor-pointer select-none",
          "hover:opacity-80 active:scale-[0.97]",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          size === "sm" && "px-3 py-1.5 text-xs",
          size === "md" && "px-4 py-2.5 text-sm",
          size === "lg" && "px-5 py-3 text-sm",
          className,
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export { Button };
