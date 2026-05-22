import { z } from "zod";

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "La descripción es obligatoria"),
  quantity: z.coerce.number().min(0.01, "Cantidad mayor que 0"),
  unitPrice: z.coerce.number().min(0, "Precio no puede ser negativo"),
});

export const invoiceSchema = z.object({
  companyName: z.string().min(1, "La empresa es obligatoria"),
  contactName: z.string().min(1, "El contacto es obligatorio"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  leadId: z.string().optional().nullable(),
  proposalId: z.string().optional().nullable(),
  taxRate: z.coerce.number().min(0).max(100).default(21),
  discountAmount: z.coerce.number().min(0).default(0),
  issueDate: z.string().min(1, "La fecha de emisión es obligatoria"),
  dueDate: z.string().min(1, "La fecha de vencimiento es obligatoria"),
  isRecurring: z.boolean().default(false),
  recurringPeriod: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "Añade al menos un concepto"),
});

export type InvoiceSchema = z.infer<typeof invoiceSchema>;

export const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, "El importe debe ser mayor que 0"),
  method: z.enum(["TRANSFER", "CARD", "CASH", "CHEQUE", "OTHER"]),
  date: z.string().min(1, "La fecha es obligatoria"),
  notes: z.string().optional().nullable(),
});

export type PaymentSchema = z.infer<typeof paymentSchema>;
