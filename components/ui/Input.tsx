import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg transition-all duration-150",
            "focus:outline-none focus:ring-2",
            className,
          )}
          style={{
            background: "var(--bg-input)",
            color: "var(--text-1)",
            border: error ? "1px solid var(--danger)" : "1px solid var(--border)",
          }}
          onFocus={(e) => {
            (e.target as HTMLElement).style.borderColor = "var(--accent)";
            (e.target as HTMLElement).style.boxShadow = "0 0 0 3px var(--accent-muted)";
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            (e.target as HTMLElement).style.borderColor = error ? "var(--danger)" : "var(--border)";
            (e.target as HTMLElement).style.boxShadow = "none";
            props.onBlur?.(e);
          }}
          {...props}
        />
        {error && <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: "var(--text-3)" }}>{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
export { Input };
