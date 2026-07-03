type Sponsor = {
  sponsor: string;
  logo: string;
  alt: string;
  url: string;
  selector: string;
  tokenMultiplier: number;
};

type StrapiSponsorResponse = {
  data?: Array<{
    id: number;
    attributes?: {
      sponsor?: string;
      logo?: {
        data?: {
          id: number;
          attributes?: {
            url?: string;
          };
        } | null;
      };
      alt?: string;
      url?: string;
      selector?: string;
      tokenMultiplier?: number;
      active?: boolean;
      sortOrder?: number;
    };
  }>;
};

const DEFAULT_STRAPI_BROWSER_PATH = '/cms';

function getStrapiUrl() {
  const baseUrl = process.env.STRAPI_URL?.trim();

  if (!baseUrl) {
    return null;
  }

  return baseUrl.replace(/\/$/, '');
}

function getStrapiPublicUrl() {
  const baseUrl = process.env.STRAPI_PUBLIC_URL?.trim();

  if (!baseUrl) {
    return DEFAULT_STRAPI_BROWSER_PATH;
  }

  return baseUrl.replace(/\/$/, '') || DEFAULT_STRAPI_BROWSER_PATH;
}

function toBrowserMediaUrl(url: string) {
  if (!url) {
    return '';
  }

  const publicUrl = getStrapiPublicUrl();

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  if (publicUrl && url.startsWith('/')) {
    return `${publicUrl}${url}`;
  }

  return url;
}

async function getStrapiSponsors(): Promise<Sponsor[] | null> {
  const strapiUrl = getStrapiUrl();

  if (!strapiUrl) {
    return null;
  }

  const response = await fetch(
    `${strapiUrl}/api/sponsors?sort[0]=sortOrder:asc&filters[active][$eq]=true&pagination[pageSize]=100&populate[logo][fields][0]=url`,
    {
      next: {
        revalidate: 300,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch sponsors from Strapi: ${response.status}`);
  }

  const payload = (await response.json()) as StrapiSponsorResponse;
  const items = payload.data ?? [];

  return items
    .map((item) => item.attributes)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({
      sponsor: item.sponsor ?? '',
      logo: toBrowserMediaUrl(item.logo?.data?.attributes?.url ?? ''),
      alt: item.alt ?? '',
      url: item.url ?? '',
      selector: item.selector ?? '',
      tokenMultiplier: item.tokenMultiplier ?? 100,
    }))
    .filter((item) => item.sponsor && item.logo && item.url && item.selector);
}

export async function getSponsors(): Promise<Sponsor[]> {
  try {
    const strapiSponsors = await getStrapiSponsors();

    if (strapiSponsors && strapiSponsors.length > 0) {
      return strapiSponsors;
    }
  } catch (error) {
    console.error(error);
  }

  console.log('No sponsors found from Strapi, returning empty list.');

  return [];
}
