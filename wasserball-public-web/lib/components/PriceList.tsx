import { cn } from './utils';
import type {
  PriceListContent,
  PriceListLocale,
  PriceListProduct,
} from '../strapi/price-list';

type PriceListProps = {
  content: PriceListContent | null;
  locale: PriceListLocale;
  className?: string;
};

const categoryLabels: Record<
  PriceListLocale,
  Record<PriceListProduct['category'], string>
> = {
  de: {
    drinks: 'Getränke',
    coffee_and_cake: 'Kaffee + Kuchen',
    grill: 'Leckeres vom Grill / aus der Fritteuse',
    vouchers: 'Wertkarten',
  },
  en: {
    drinks: 'Drinks',
    coffee_and_cake: 'Coffee + cake',
    grill: 'From the grill / fryer',
    vouchers: 'Value cards',
  },
  nl: {
    drinks: 'Dranken',
    coffee_and_cake: 'Koffie + gebak',
    grill: 'Van de grill / uit de frituur',
    vouchers: 'Waardekaarten',
  },
};

const unavailableLabels: Record<PriceListLocale, string> = {
  de: 'Ausverkauft',
  en: 'Sold out',
  nl: 'Uitverkocht',
};

const currencyLocales: Record<PriceListLocale, string> = {
  de: 'de-DE',
  en: 'en-GB',
  nl: 'nl-NL',
};

export default function PriceList({
  content,
  locale,
  className = '',
}: PriceListProps) {
  if (!content) return null;

  const groupedProducts = Object.entries(categoryLabels[locale]).map(
    ([category, label]) => ({
      category: category as PriceListProduct['category'],
      label,
      products: content.products.filter(
        (product) => product.category === category,
      ),
    }),
  );
  const hasAlcohol = content.products.some((product) => product.alcoholic);
  const formatter = new Intl.NumberFormat(currencyLocales[locale], {
    style: 'currency',
    currency: 'EUR',
  });

  return (
    <div
      className={cn(
        'rounded-[1.75rem] border border-[rgba(28,28,28,0.08)] bg-white p-6 shadow-[0_18px_40px_rgba(28,28,28,0.08)] min-h-[50vh] items-center justify-center',
        className,
      )}
    >
      <h2 className="mb-6 font-mono text-2xl font-bold uppercase text-[var(--brand-ink)]">
        {content.heading}
      </h2>
      {content.paymentNotice ? (
        <p className="mb-7 rounded-xl bg-[var(--surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--brand-ink)]">
          {content.paymentNotice}
        </p>
      ) : null}
      <div className="space-y-7">
        {groupedProducts.map(({ category, label, products }) =>
          products.length ? (
            <section key={category}>
              <h3 className="mb-3 font-mono text-lg font-bold uppercase text-[var(--brand-red)]">
                {label}
              </h3>
              <ul className="space-y-3">
                {products.map((product) => (
                  <li
                    key={product.id || `${category}-${product.name}`}
                    className={cn(
                      'grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-b border-dashed border-black/15 pb-2',
                      product.unavailable &&
                        'text-[var(--brand-gray)] line-through decoration-2',
                    )}
                  >
                    <span className="font-semibold">
                      {product.name}
                      {product.alcoholic ? (
                        <sup className="ml-1 text-[var(--brand-red)]">*</sup>
                      ) : null}
                    </span>
                    <span className="font-mono font-bold">
                      {product.priceNote ??
                        (product.price === null
                          ? '–'
                          : formatter.format(product.price))}
                    </span>
                    {product.unit ? (
                      <span className="text-sm text-[var(--brand-gray)]">
                        {product.unit}
                      </span>
                    ) : null}
                    {product.unavailable ? (
                      <span className="text-right text-xs font-bold uppercase no-underline [text-decoration:none]">
                        {unavailableLabels[locale]}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null,
        )}
      </div>
      {hasAlcohol ? (
        <p className="mt-7 rounded-xl bg-[rgba(214,34,31,0.08)] p-4 text-sm leading-6 text-[var(--brand-ink)]">
          <span
            aria-hidden="true"
            className="mr-1 font-bold text-[var(--brand-red)]"
          >
            *
          </span>
          {content.youthNotice}
        </p>
      ) : null}
    </div>
  );
}
