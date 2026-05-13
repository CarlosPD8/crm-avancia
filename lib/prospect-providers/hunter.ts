interface HunterEmail {
  value: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  confidence: number;
}

interface HunterResponse {
  data?: {
    emails?: HunterEmail[];
  };
  errors?: { details: string }[];
}

export interface HunterContact {
  name: string;
  email: string;
  position: string;
}

export function extractDomain(websiteUrl: string): string | null {
  try {
    const { hostname } = new URL(websiteUrl);
    return hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export async function findContactByDomain(domain: string): Promise<HunterContact | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) return null;

  const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&api_key=${encodeURIComponent(apiKey)}&limit=5`;

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      console.warn(`[Hunter.io] ${response.status} para dominio: ${domain}`);
      return null;
    }

    const data: HunterResponse = await response.json();
    const emails = data.data?.emails;
    if (!emails?.length) return null;

    const best = [...emails].sort((a, b) => b.confidence - a.confidence)[0];

    return {
      name: [best.first_name, best.last_name].filter(Boolean).join(" "),
      email: best.value,
      position: best.position ?? "",
    };
  } catch {
    return null;
  }
}
