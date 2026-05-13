import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn("w-full px-3 py-2 text-sm rounded-lg transition-all duration-150 cursor-pointer appearance-none focus:outline-none", className)}
          style={{
            background: "var(--bg-input)",
            color: "var(--text-1)",
            border: error ? "1px solid var(--danger)" : "1px solid var(--border)",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            backgroundSize: "16px",
            paddingRight: "36px",
          }}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
        {hint && !error && <p className="text-xs" style={{ color: "var(--text-3)" }}>{hint}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
export { Select };
