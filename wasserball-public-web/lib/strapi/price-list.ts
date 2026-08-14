import { getSingleTypeContent } from './single-types';

export type PriceListLocale = 'de' | 'en' | 'nl';

export type PriceListProduct = {
  id: number;
  category: 'drinks' | 'coffee_and_cake' | 'grill' | 'vouchers';
  name: string;
  unit: string | null;
  price: number | null;
  priceNote: string | null;
  alcoholic: boolean;
  unavailable: boolean;
  sortOrder: number;
};

export type PriceListContent = {
  heading: string;
  paymentNotice: string | null;
  youthNotice: string;
  products: PriceListProduct[];
};

type ApiProduct = {
  id?: unknown;
  category?: unknown;
  name_de?: unknown;
  name_en?: unknown;
  name_nl?: unknown;
  unit_de?: unknown;
  unit_en?: unknown;
  unit_nl?: unknown;
  price?: unknown;
  price_note_de?: unknown;
  price_note_en?: unknown;
  price_note_nl?: unknown;
  alcoholic?: unknown;
  unavailable?: unknown;
  sort_order?: unknown;
};

type ApiPriceList = Record<string, unknown> & { products?: unknown };

const categories = new Set<PriceListProduct['category']>([
  'drinks',
  'coffee_and_cake',
  'grill',
  'vouchers',
]);

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function localizedText(
  source: Record<string, unknown>,
  field: string,
  locale: PriceListLocale,
): string | null {
  return text(source[`${field}_${locale}`]) ?? text(source[`${field}_de`]);
}

function price(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function product(
  value: unknown,
  locale: PriceListLocale,
): PriceListProduct | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as ApiProduct;
  if (!categories.has(source.category as PriceListProduct['category'])) {
    return null;
  }
  const name = localizedText(source as Record<string, unknown>, 'name', locale);
  if (!name) return null;

  return {
    id: typeof source.id === 'number' ? source.id : 0,
    category: source.category as PriceListProduct['category'],
    name,
    unit: localizedText(source as Record<string, unknown>, 'unit', locale),
    price: price(source.price),
    priceNote: localizedText(
      source as Record<string, unknown>,
      'price_note',
      locale,
    ),
    alcoholic: source.alcoholic === true,
    unavailable: source.unavailable === true,
    sortOrder: typeof source.sort_order === 'number' ? source.sort_order : 0,
  };
}

export async function getPriceList(
  locale: string,
): Promise<PriceListContent | null> {
  const selectedLocale: PriceListLocale =
    locale === 'en' || locale === 'nl' ? locale : 'de';
  const source = await getSingleTypeContent<ApiPriceList>('price-list', {
    populate: 'products',
  });
  if (!source) return null;

  const heading = localizedText(source, 'heading', selectedLocale);
  const paymentNotice = localizedText(
    source,
    'payment_notice',
    selectedLocale,
  );
  const youthNotice = localizedText(source, 'youth_notice', selectedLocale);
  if (!heading || !youthNotice) return null;

  const products = Array.isArray(source.products)
    ? source.products
        .map((entry) => product(entry, selectedLocale))
        .filter((entry): entry is PriceListProduct => entry !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return { heading, paymentNotice, youthNotice, products };
}
