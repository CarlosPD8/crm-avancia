import { z } from "zod";

export const prospectSearchSchema = z.object({
  industry: z.string().min(1, "El sector es obligatorio"),
  location: z.string().min(1, "La ubicación es obligatoria"),
  companySize: z
    .enum(["1-10", "11-50", "51-200", "201-500", "500+"])
    .optional()
    .or(z.literal("")),
  keywords: z.string().optional().or(z.literal("")),
});

export type ProspectSearchFormValues = z.infer<typeof prospectSearchSchema>;
