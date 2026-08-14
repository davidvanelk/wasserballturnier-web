import { getScopedI18n } from '@/app/i18n/server';
import PageHero from '@/lib/components/PageHero';
import PriceList from '@/lib/components/PriceList';
import SponsorAdvertisement from '@/lib/components/SponsorAdvertisement';
import { getPriceList, type PriceListLocale } from '@/lib/strapi/price-list';

export const dynamic = 'force-dynamic';

export default async function PriceListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const priceListLocale: PriceListLocale =
    locale === 'en' || locale === 'nl' ? locale : 'de';
  const [priceList, t] = await Promise.all([
    getPriceList(priceListLocale),
    getScopedI18n('price_list'),
  ]);

  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <SponsorAdvertisement />
      <PriceList content={priceList} locale={priceListLocale} />
    </main>
  );
}
