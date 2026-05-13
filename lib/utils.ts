import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import type { AppointmentStatus, LeadStatus, LeadSource } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Hoy";
  if (isTomorrow(d)) return "Mañana";
  return format(d, "d MMM yyyy", { locale: es });
}

export function formatDateFull(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d 'de' MMMM yyyy", { locale: es });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd/MM/yyyy");
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${period}`;
}

export function formatCreatedAt(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM yyyy", { locale: es });
}

export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

export function getStartOfWeek(date: Date): Date {
  return startOfWeek(date, { locale: es });
}

export function getEndOfWeek(date: Date): Date {
  return endOfWeek(date, { locale: es });
}

// Status labels
export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  DONE: "Realizada",
  CANCELLED: "Cancelada",
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "Nuevo",
  CONTACTED: "Contactado",
  QUALIFIED: "Cualificado",
  DISCARDED: "Descartado",
  CONVERTED: "Convertido",
};

export const leadSourceLabels: Record<LeadSource, string> = {
  MANUAL: "Manual",
  GOOGLE_PLACES: "Google Places",
  LINKEDIN: "LinkedIn",
  APOLLO: "Apollo",
  CLAY: "Clay",
  CLEARBIT: "Clearbit",
  SERPAPI: "SerpAPI",
  REFERRAL: "Referido",
  WEBSITE: "Web",
  OTHER: "Otro",
};

export function getAppointmentStatusLabel(status: AppointmentStatus): string {
  return appointmentStatusLabels[status] ?? status;
}

export function getLeadStatusLabel(status: LeadStatus): string {
  return leadStatusLabels[status] ?? status;
}

export function getLeadSourceLabel(source: LeadSource): string {
  return leadSourceLabels[source] ?? source;
}
