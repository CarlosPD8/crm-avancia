"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { prospectSearchSchema } from "@/lib/validators/prospect-search.schema";
import { googlePlacesProvider } from "@/lib/prospect-providers/google-places";
import { findContactByDomain, extractDomain } from "@/lib/prospect-providers/hunter";
import type { ActionResult, ProspectResult } from "@/types";

export async function searchProspects(
  formData: unknown
): Promise<ActionResult<ProspectResult[]>> {
  const parsed = prospectSearchSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos de búsqueda inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await prisma.prospectSearch.create({
      data: {
        industry: parsed.data.industry,
        location: parsed.data.location,
        companySize: parsed.data.companySize || null,
        keywords: parsed.data.keywords || null,
      },
    });

    const results = await googlePlacesProvider.search(parsed.data);
    console.log(`[Google Places] ${results.length} resultados para "${parsed.data.industry} en ${parsed.data.location}"`);

    return { success: true, data: results };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al realizar la búsqueda.";
    console.error("[searchProspects] Error:", message);
    return { success: false, error: message };
  }
}

export async function enrichProspectContact(
  websiteUri: string
): Promise<ActionResult<{ name: string; email: string; position: string }>> {
  const domain = extractDomain(websiteUri);
  if (!domain) return { success: false, error: "URL de web inválida" };

  const contact = await findContactByDomain(domain);
  if (!contact || !contact.email) {
    return { success: false, error: "No se encontró contacto para este dominio" };
  }

  return { success: true, data: contact };
}

export async function saveProspectAsLead(
  prospect: ProspectResult
): Promise<ActionResult<{ id: string }>> {
  try {
    const notes = [
      prospect.location ? `Ubicación: ${prospect.location}` : null,
      prospect.companySize ? `Tamaño: ${prospect.companySize}` : null,
      !prospect.contactName || !prospect.email
        ? "Contacto y email pendientes de completar"
        : null,
    ]
      .filter(Boolean)
      .join(". ");

    const lead = await prisma.lead.create({
      data: {
        companyName: prospect.companyName,
        contactName: prospect.contactName || "Sin contacto",
        email: prospect.email || `pendiente.${prospect.id.slice(-8)}@completar.local`,
        phone: prospect.phone || null,
        website: prospect.website || null,
        industry: prospect.industry,
        source: prospect.source === "MOCK" ? "OTHER" : prospect.source,
        status: "NEW",
        notes: notes || null,
      },
    });

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { success: true, data: { id: lead.id } };
  } catch {
    return { success: false, error: "Error al guardar el prospecto como lead." };
  }
}
