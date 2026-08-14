import { getSingleTypeContent } from './single-types';
import type { PriceListLocale } from './price-list';

export type LandingLinkContent = {
  teams: { title: string; text: string };
  priceList: { title: string; text: string };
};

type LandingLinksResponse = Record<string, unknown>;

function localizedText(
  content: LandingLinksResponse,
  field: string,
  locale: PriceListLocale,
): string | null {
  const localized = content[`${field}_${locale}`];
  const fallback = content[`${field}_de`];
  const value =
    typeof localized === 'string' && localized.trim() ? localized : fallback;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function getLandingLinks(
  locale: PriceListLocale,
): Promise<LandingLinkContent | null> {
  const content = await getSingleTypeContent<LandingLinksResponse>(
    'landing-links',
  );
  if (!content) return null;

  const teamsTitle = localizedText(content, 'teams_title', locale);
  const teamsText = localizedText(content, 'teams_text', locale);
  const priceListTitle = localizedText(content, 'price_list_title', locale);
  const priceListText = localizedText(content, 'price_list_text', locale);
  if (!teamsTitle || !teamsText || !priceListTitle || !priceListText) {
    return null;
  }

  return {
    teams: { title: teamsTitle, text: teamsText },
    priceList: { title: priceListTitle, text: priceListText },
  };
}
