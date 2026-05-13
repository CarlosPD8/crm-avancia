"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, description, children, size = "md", className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "var(--bg-overlay)" }}
        onClick={onClose}
      />
      {/* Dialog */}
      <div
        className={cn(
          "relative w-full rounded-2xl max-h-[90vh] flex flex-col",
          sizeMap[size],
          className,
        )}
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Header */}
        {(title || description) && (
          <div
            className="flex items-start justify-between gap-4 px-6 pt-5 pb-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              {title && (
                <h2 className="text-base font-semibold" style={{ color: "var(--text-1)" }}>
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm" style={{ color: "var(--text-2)" }}>
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 transition-colors"
              style={{ color: "var(--text-3)", background: "transparent" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "var(--bg-elevated)";
                (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
