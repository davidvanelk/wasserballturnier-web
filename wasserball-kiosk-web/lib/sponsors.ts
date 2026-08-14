export type Sponsor = {
  sponsor: string;
  logoPath: string;
  alt: string;
  tokenMultiplier: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mediaPath(value: unknown): string | null {
  if (!isRecord(value) || typeof value.url !== 'string') return null;
  try {
    const pathname = value.url.startsWith('http')
      ? new URL(value.url).pathname
      : value.url;
    return pathname.startsWith('/uploads/') ? pathname : null;
  } catch {
    return null;
  }
}

export async function getSponsors(): Promise<Sponsor[]> {
  const strapiUrl = process.env.STRAPI_URL?.replace(/\/$/, '');
  if (!strapiUrl) return [];

  try {
    const query = new URLSearchParams({
      'populate[logo][fields][0]': 'url',
      'filters[active][$eq]': 'true',
      'pagination[limit]': '100',
    });
    const response = await fetch(`${strapiUrl}/api/sponsors?${query}`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.data)) return [];
    return payload.data.flatMap((value): Sponsor[] => {
      if (!isRecord(value)) return [];
      const logoPath = mediaPath(value.logo);
      if (typeof value.sponsor !== 'string' || !logoPath) return [];
      return [{
        sponsor: value.sponsor,
        logoPath,
        alt: typeof value.alt === 'string' ? value.alt : value.sponsor,
        tokenMultiplier:
          typeof value.tokenMultiplier === 'number' && value.tokenMultiplier > 0
            ? value.tokenMultiplier
            : 100,
      }];
    });
  } catch {
    return [];
  }
}
