import { z } from "zod";

export const proposalSchema = z.object({
  companyName: z.string().min(1, "Requerido"),
  contactName: z.string().min(1, "Requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  leadId: z.string().optional(),
  status: z.enum(["DRAFT", "SENT", "NEGOTIATING", "ACCEPTED", "REJECTED"]).default("DRAFT"),
  value: z.coerce.number().positive("Debe ser mayor que 0").optional().nullable(),
  notes: z.string().optional(),
  pdfPath: z.string().optional().nullable(),
  pdfName: z.string().optional().nullable(),
  pdfSize: z.coerce.number().optional().nullable(),
  sentAt: z.string().optional().nullable(),
});

export type ProposalFormValues = z.input<typeof proposalSchema>;
