import type { ProspectResult, ProspectSearchParams } from "@/types";

const mockDatabase: ProspectResult[] = [
  // Inmobiliarias
  { id: "m1", companyName: "Inmobiliaria Nexo", contactName: "Carlos Ruiz", email: "carlos@nexo.es", phone: "+34 612 345 678", website: "https://nexo.es", industry: "Inmobiliaria", location: "Madrid", companySize: "11-50", source: "MOCK" },
  { id: "m2", companyName: "Propiedades del Sol", contactName: "Ana Martínez", email: "ana@propiedadesdelsol.es", phone: "+34 623 456 789", website: "https://propiedadesdelsol.es", industry: "Inmobiliaria", location: "Valencia", companySize: "1-10", source: "MOCK" },
  { id: "m3", companyName: "Grupo Habitat", contactName: "Luis García", email: "luis@grupohabitat.com", phone: "+34 634 567 890", website: "https://grupohabitat.com", industry: "Inmobiliaria", location: "Barcelona", companySize: "51-200", source: "MOCK" },
  { id: "m4", companyName: "Casas Premium", contactName: "Elena López", email: "elena@casaspremium.es", phone: "+34 645 678 901", website: "https://casaspremium.es", industry: "Inmobiliaria", location: "Sevilla", companySize: "1-10", source: "MOCK" },
  // Clínicas
  { id: "m5", companyName: "Clínica Bienestar", contactName: "Dr. Pedro Sánchez", email: "pedro@clinicabienestar.es", phone: "+34 656 789 012", website: "https://clinicabienestar.es", industry: "Clínica", location: "Madrid", companySize: "11-50", source: "MOCK" },
  { id: "m6", companyName: "Centro Médico Avanza", contactName: "Dra. María Torres", email: "maria@centromedico.es", phone: "+34 667 890 123", website: "https://centromedico.es", industry: "Clínica", location: "Bilbao", companySize: "51-200", source: "MOCK" },
  { id: "m7", companyName: "Dental Fresno", contactName: "Dr. Jorge Fresno", email: "jorge@dentalfresno.es", phone: "+34 678 901 234", website: "https://dentalfresno.es", industry: "Clínica", location: "Zaragoza", companySize: "1-10", source: "MOCK" },
  // Asesorías
  { id: "m8", companyName: "Despacho Contable Torres", contactName: "Roberto Torres", email: "roberto@dctorres.es", phone: "+34 689 012 345", website: "https://dctorres.es", industry: "Asesoría", location: "Madrid", companySize: "1-10", source: "MOCK" },
  { id: "m9", companyName: "Asesores Fiscales Ibérica", contactName: "Cristina Ibáñez", email: "cristina@afi.es", phone: "+34 690 123 456", website: "https://afi.es", industry: "Asesoría", location: "Barcelona", companySize: "11-50", source: "MOCK" },
  // Despachos de abogados
  { id: "m10", companyName: "Bufete Jiménez & Asociados", contactName: "Francisco Jiménez", email: "francisco@bufetejimenez.es", phone: "+34 601 234 567", website: "https://bufetejimenez.es", industry: "Despacho Legal", location: "Madrid", companySize: "11-50", source: "MOCK" },
  { id: "m11", companyName: "Lex Consultoría", contactName: "Patricia Vega", email: "patricia@lexconsultoria.es", phone: "+34 612 345 678", website: "https://lexconsultoria.es", industry: "Despacho Legal", location: "Valencia", companySize: "1-10", source: "MOCK" },
  // Ecommerce
  { id: "m12", companyName: "TiendaFlex", contactName: "Andrés Molina", email: "andres@tiendaflex.com", phone: "+34 623 456 789", website: "https://tiendaflex.com", industry: "Ecommerce", location: "Barcelona", companySize: "11-50", source: "MOCK" },
  { id: "m13", companyName: "Moda Urbana Online", contactName: "Sara Delgado", email: "sara@modaurbana.es", phone: "+34 634 567 890", website: "https://modaurbana.es", industry: "Ecommerce", location: "Madrid", companySize: "1-10", source: "MOCK" },
  // Restaurantes
  { id: "m14", companyName: "Restaurante El Olivo", contactName: "Manuel Herrera", email: "manuel@elolivoresturante.es", phone: "+34 645 678 901", website: "https://elolivorestaurante.es", industry: "Restauración", location: "Sevilla", companySize: "1-10", source: "MOCK" },
  { id: "m15", companyName: "La Taberna Gourmet", contactName: "Isabel Romero", email: "isabel@latabernagourmet.es", phone: "+34 656 789 012", website: "https://latabernagourmet.es", industry: "Restauración", location: "Granada", companySize: "1-10", source: "MOCK" },
  // Tecnología
  { id: "m16", companyName: "DevSolutions SL", contactName: "Álvaro Castillo", email: "alvaro@devsolutions.es", phone: "+34 667 890 123", website: "https://devsolutions.es", industry: "Tecnología", location: "Madrid", companySize: "11-50", source: "MOCK" },
  { id: "m17", companyName: "Innovatech", contactName: "Nuria Campos", email: "nuria@innovatech.es", phone: "+34 678 901 234", website: "https://innovatech.es", industry: "Tecnología", location: "Barcelona", companySize: "51-200", source: "MOCK" },
  // Educación
  { id: "m18", companyName: "Academia Futuro", contactName: "David Moreno", email: "david@academiafuturo.es", phone: "+34 689 012 345", website: "https://academiafuturo.es", industry: "Educación", location: "Valencia", companySize: "1-10", source: "MOCK" },
  { id: "m19", companyName: "Centro de Formación ProSkills", contactName: "Laura Peña", email: "laura@proskills.es", phone: "+34 690 123 456", website: "https://proskills.es", industry: "Educación", location: "Madrid", companySize: "11-50", source: "MOCK" },
  // Logística
  { id: "m20", companyName: "TransLog Express", contactName: "Miguel Ángel Ramos", email: "miguelangel@translog.es", phone: "+34 601 234 567", website: "https://translog.es", industry: "Logística", location: "Zaragoza", companySize: "51-200", source: "MOCK" },
];

export function searchMockProspects(params: ProspectSearchParams): ProspectResult[] {
  let results = [...mockDatabase];

  if (params.industry) {
    const industryLower = params.industry.toLowerCase();
    results = results.filter(
      (p) =>
        p.industry.toLowerCase().includes(industryLower) ||
        industryLower.includes(p.industry.toLowerCase())
    );
  }

  if (params.location) {
    const locationLower = params.location.toLowerCase();
    results = results.filter((p) =>
      p.location.toLowerCase().includes(locationLower)
    );
  }

  if (params.companySize && params.companySize !== "") {
    results = results.filter((p) => p.companySize === params.companySize);
  }

  if (params.keywords) {
    const kw = params.keywords.toLowerCase();
    results = results.filter(
      (p) =>
        p.companyName.toLowerCase().includes(kw) ||
        p.contactName.toLowerCase().includes(kw) ||
        p.industry.toLowerCase().includes(kw)
    );
  }

  // Si no hay resultados con filtros estrictos, devolver una muestra
  if (results.length === 0) {
    return mockDatabase.slice(0, 5).map((p) => ({
      ...p,
      industry: params.industry || p.industry,
      location: params.location || p.location,
    }));
  }

  return results;
}
