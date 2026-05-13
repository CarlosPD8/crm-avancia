import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "rounded-full border-2 animate-spin",
          size === "sm" && "h-4 w-4",
          size === "md" && "h-6 w-6",
          size === "lg" && "h-8 w-8",
        )}
        style={{
          borderColor: "var(--border-strong)",
          borderTopColor: "var(--accent)",
        }}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <LoadingSpinner size="lg" />
    </div>
  );
}
