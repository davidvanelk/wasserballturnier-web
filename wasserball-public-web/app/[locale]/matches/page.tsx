import { getCurrentLocale, getScopedI18n } from '@/app/i18n/server';
import FlyerSurface from '@/lib/components/FlyerSurface';
import MatchTable from '@/lib/components/MatchTable';
import PageHero from '@/lib/components/PageHero';
import SponsorAdvertisement from '@/lib/components/SponsorAdvertisement';
import { getAllMatches } from '@/lib/strapi/tournament';

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const locale = await getCurrentLocale();
  const t = await getScopedI18n('matches');
  const matches = await getAllMatches();

  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />
      <SponsorAdvertisement />
      <FlyerSurface className="overflow-hidden">
        <MatchTable
          locale={locale}
          matches={matches}
          labels={{
            time: t('time'),
            match: t('match'),
            score: t('score'),
            penaltyPoints: t('penalty_points'),
            status: t('status'),
            notSet: t('not_set'),
            empty: t('empty'),
            statuses: {
              scheduled: t('status_scheduled'),
              in_progress: t('status_in_progress'),
              completed: t('status_completed'),
              cancelled: t('status_cancelled'),
            },
          }}
        />
      </FlyerSurface>
    </main>
  );
}
