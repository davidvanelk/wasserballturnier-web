import MatchTable from '@/lib/components/MatchTable';
import PriceList from '@/lib/components/PriceList';
import { getScopedI18n } from '@/app/i18n/server';

export default async function HomePage() {
  const t = await getScopedI18n('home');
  return (
    <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold">{t('welcome')}</h1>
        <h1 className="text-3xl">{t('tournament')}</h1>
        <h5 className="text-red-400">by Löschzug Elten</h5>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              {t('image_alt')}
            </h1>
          </div>
        </div>
        <MatchTable />
        <PriceList />
      </div>
    </main>
  );
}
