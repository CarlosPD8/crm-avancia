import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={3}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-lg transition-all duration-150 resize-none focus:outline-none",
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

Textarea.displayName = "Textarea";
export { Textarea };
