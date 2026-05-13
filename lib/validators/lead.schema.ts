import { z } from "zod";

export const leadSchema = z.object({
  companyName: z.string().min(1, "El nombre de la empresa es obligatorio").max(200),
  contactName: z.string().min(1, "El nombre del contacto es obligatorio").max(200),
  email: z.string().email("Email inválido"),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  industry: z.string().min(1, "El sector es obligatorio"),
  source: z.enum([
    "MANUAL",
    "GOOGLE_PLACES",
    "LINKEDIN",
    "APOLLO",
    "CLAY",
    "CLEARBIT",
    "SERPAPI",
    "REFERRAL",
    "WEBSITE",
    "OTHER",
  ]),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "DISCARDED", "CONVERTED"]),
  notes: z.string().optional().or(z.literal("")),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
