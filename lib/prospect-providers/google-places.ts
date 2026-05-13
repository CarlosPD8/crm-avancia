import type { ProspectProvider, ProspectResult, ProspectSearchParams } from "@/types";

interface PlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: unknown;
  rating?: number;
  userRatingCount?: number;
}

interface PlacesApiResponse {
  places?: PlaceResult[];
  error?: { message: string; status: string };
}

export const googlePlacesProvider: ProspectProvider = {
  name: "Google Places",

  async search(params: ProspectSearchParams): Promise<ProspectResult[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY no configurada");

    const textQuery = [params.keywords, params.industry, "en", params.location]
      .filter(Boolean)
      .join(" ");

    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri",
      },
      body: JSON.stringify({
        textQuery,
        languageCode: "es",
        maxResultCount: 20,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const err: PlacesApiResponse = await response.json().catch(() => ({}));
      throw new Error(`Google Places (${response.status}): ${err.error?.message ?? response.statusText}`);
    }

    const data: PlacesApiResponse = await response.json();

    const places = data.places ?? [];
    const withPhone = places.filter((p) => p.nationalPhoneNumber || p.internationalPhoneNumber).length;
    console.log(`[Google Places] ${places.length} resultados, ${withPhone} con teléfono`);
    if (places[0]) {
      console.log("[Google Places] Primer resultado:", JSON.stringify(places[0]));
    }

    return places.map((place) => ({
      id: place.id,
      companyName: place.displayName?.text ?? "Sin nombre",
      contactName: "",
      email: "",
      phone: place.nationalPhoneNumber ?? place.internationalPhoneNumber ?? "",
      website: place.websiteUri ?? "",
      industry: params.industry,
      location: place.formattedAddress ?? params.location,
      companySize: params.companySize ?? "",
      source: "GOOGLE_PLACES" as const,
    }));
  },
};
