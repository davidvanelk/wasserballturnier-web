import { logger } from '../logger';
import { getStrapiContent, toBrowserMediaUrl } from '../strapi/api';

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

async function getStrapiSponsors(): Promise<Sponsor[] | null> {
  const sponsors = await getStrapiContent<StrapiSponsorResponse[]>(
    'sponsors',
    {
      'populate[logo][fields][0]': 'url',
    },
    {
      next: { revalidate: 600 },
    },
  );

  if (!sponsors) {
    logger.warn('No sponsors found in Strapi response.');
    return null;
  }

  return sponsors
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
