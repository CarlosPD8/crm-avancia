export type {
  User,
  Appointment,
  Lead,
  ProspectSearch,
  AppointmentStatus,
  LeadStatus,
  LeadSource,
  UserRole,
} from "@prisma/client";

import type { Appointment, User } from "@prisma/client";

export type AppointmentWithUser = Appointment & {
  assignedUser: User | null;
};

export interface ProspectResult {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  location: string;
  companySize: string;
  contactPosition?: string;
  source: "MOCK" | "GOOGLE_PLACES" | "LINKEDIN" | "APOLLO" | "SERPAPI";
}

export interface ProspectProvider {
  name: string;
  search(params: ProspectSearchParams): Promise<ProspectResult[]>;
}

export interface ProspectSearchParams {
  industry: string;
  location: string;
  companySize?: string;
  keywords?: string;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
