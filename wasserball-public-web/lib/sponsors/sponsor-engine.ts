import { logger } from '../logger';

type Sponsor = {
  sponsor: string;
  logo: string;
  alt: string;
  url: string;
  selector: string;
  tokenMultiplier: number;
};

type StrapiSponsorResponse = {
  id: number;
  sponsor: string;
  alt: string;
  url: string;
  selector: string;
  sortOrder: number;
  tokenMultiplier: number;
  logo: {
    id: number;
    documentId: string;
    url: string;
  };
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

  logger.info(
    `Fetching sponsors from Strapi at: ${strapiUrl ?? 'not configured'}`,
  );

  if (!strapiUrl) {
    return null;
  }

  const sponsorEndpoint = `${strapiUrl}/api/sponsors?sort[0]=sortOrder:asc&filters[active][$eq]=true&pagination[pageSize]=100&populate[logo][fields][0]=url`;
  logger.info(`Calling Strapi endpoint: ${sponsorEndpoint}`);

  const response = await fetch(sponsorEndpoint, {
    next: {
      revalidate: 300,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch sponsors from Strapi: ${response.status}`);
  }

  const payload = (await response.json()).data as StrapiSponsorResponse[];
  const items = payload ?? [];

  return items
    .map((item) => ({
      sponsor: item.sponsor ?? '',
      logo: toBrowserMediaUrl(item.logo?.url ?? ''),
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
    logger.error(`Error fetching sponsors from Strapi: ${error}`);
  }

  logger.info('No sponsors found from Strapi, returning empty list.');

  return [];
}
