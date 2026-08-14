import MatchTable from '@/lib/components/MatchTable';
import PageHero from '@/lib/components/PageHero';
import PriceList from '@/lib/components/PriceList';
import { getPriceList, type PriceListLocale } from '@/lib/strapi/price-list';

export const dynamic = 'force-dynamic';

export default async function MatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const priceListLocale: PriceListLocale =
    locale === 'en' || locale === 'nl' ? locale : 'de';
  const priceList = await getPriceList(priceListLocale);

  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero
        eyebrow="Turniertag"
        title="Hier spielt die Musik"
        description="Spielplan und Verpflegung bleiben in derselben Flyer-Struktur gebündelt, damit Besucher den Tag schnell erfassen können."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
        <MatchTable />
        <PriceList content={priceList} locale={priceListLocale} />
      </div>
    </main>
  );
}
