import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={cn("flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5", className)}
      style={{ background: "var(--bg)" }}
    >
      {children}
    </main>
  );
}
