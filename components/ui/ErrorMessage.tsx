import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ErrorMessage({
  title = "Ha ocurrido un error",
  message = "No se pudieron cargar los datos. Por favor, inténtalo de nuevo.",
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-red-800">{title}</p>
        {message && <p className="mt-0.5 text-sm text-red-600">{message}</p>}
      </div>
    </div>
  );
}
