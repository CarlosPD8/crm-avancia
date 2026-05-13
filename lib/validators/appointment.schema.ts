import { z } from "zod";

export const appointmentSchema = z.object({
  companyName: z.string().min(1, "El nombre de la empresa es obligatorio").max(200),
  contactName: z.string().min(1, "El nombre del contacto es obligatorio").max(200),
  email: z.string().email("Email inválido"),
  phone: z.string().optional().or(z.literal("")),
  date: z.coerce.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/, "El formato debe ser HH:MM"),
  status: z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELLED"]),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().optional().or(z.literal("")),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
