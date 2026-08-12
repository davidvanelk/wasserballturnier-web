import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getScopedI18n } from '@/app/i18n/server';
import FlyerSurface from '@/lib/components/FlyerSurface';
import HistoryBackButton from '@/lib/components/HistoryBackButton';
import PageHero from '@/lib/components/PageHero';
import { getMatchById, type StrapiMatch } from '@/lib/strapi/tournament';

export const dynamic = 'force-dynamic';

type TranslationKey =
  | 'phase_group'
  | 'phase_playoff'
  | 'phase_quarterfinal'
  | 'phase_semifinal'
  | 'phase_third_place'
  | 'phase_final'
  | 'status_scheduled'
  | 'status_completed'
  | 'status_cancelled'
  | 'not_set'
  | 'home_team'
  | 'away_team'
  | 'back'
  | 'back_to_standings'
  | 'match'
  | 'penalty_points'
  | 'match_number'
  | 'phase'
  | 'status'
  | 'played_at'
  | 'group'
  | 'round_slot';
type Translation = (key: TranslationKey) => string;

function phaseLabel(match: StrapiMatch, t: Translation) {
  const labels = {
    group_phase: t('phase_group'),
    lucky_second_playoff: t('phase_playoff'),
    quarterfinal: t('phase_quarterfinal'),
    semifinal: t('phase_semifinal'),
    third_place: t('phase_third_place'),
    final: t('phase_final'),
  } satisfies Record<StrapiMatch['phase'], string>;
  const label = labels[match.phase];
  return match.roundSlot && ['quarterfinal', 'semifinal'].includes(match.phase)
    ? `${label} ${match.roundSlot}`
    : label;
}

function statusLabel(status: StrapiMatch['matchStatus'], t: Translation) {
  const labels = {
    scheduled: t('status_scheduled'),
    completed: t('status_completed'),
    cancelled: t('status_cancelled'),
  } satisfies Record<StrapiMatch['matchStatus'], string>;
  return labels[status];
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const matchId = Number(id);
  if (!Number.isInteger(matchId) || matchId < 1) notFound();

  const [match, scopedT] = await Promise.all([
    getMatchById(matchId),
    getScopedI18n('match_detail'),
  ]);
  if (!match) notFound();
  const t: Translation = (key) => scopedT(key);

  const playedAt = match.playedAt
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: 'full',
        timeStyle: 'short',
      }).format(new Date(match.playedAt))
    : t('not_set');
  const publicTitle =
    match.homeTeam && match.awayTeam
      ? `${match.homeTeam.name} – ${match.awayTeam.name}`
      : phaseLabel(match, t);
  const teams = [
    {
      side: t('home_team'),
      team: match.homeTeam,
      score: match.homeScore,
      penaltyPoints: match.team1PenaltyPoints,
    },
    {
      side: t('away_team'),
      team: match.awayTeam,
      score: match.awayScore,
      penaltyPoints: match.team2PenaltyPoints,
    },
  ];

  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <div>
        <HistoryBackButton
          backLabel={t('back')}
          fallbackHref={`/${locale}/standings`}
          fallbackLabel={t('back_to_standings')}
        />
      </div>

      <PageHero
        eyebrow={`${t('match')} #${match.matchNumber}`}
        title={publicTitle}
        description={`${phaseLabel(match, t)} · ${statusLabel(match.matchStatus, t)}`}
      />

      <FlyerSurface className="p-6 sm:p-8 lg:p-10">
        <div className="grid gap-5 md:grid-cols-2">
          {teams.map(({ side, team, score, penaltyPoints }) => (
            <section
              className="rounded-[1.5rem] border border-[var(--brand-line)] bg-white p-6 text-center"
              key={side}
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-red)]">
                {side}
              </p>
              {team ? (
                <Link
                  className="mt-3 block font-mono text-2xl font-semibold uppercase text-[var(--brand-ink)] hover:text-[var(--brand-red)]"
                  href={`/${locale}/teams/${team.documentId}`}
                >
                  {team.name}
                </Link>
              ) : (
                <p className="mt-3 text-[var(--brand-gray)]">{t('not_set')}</p>
              )}
              <p className="mt-5 font-mono text-5xl font-bold text-[var(--brand-ink)]">
                {score ?? '–'}
              </p>
              <p className="mt-2 text-sm text-[var(--brand-gray)]">
                {t('penalty_points')}: {penaltyPoints}
              </p>
            </section>
          ))}
        </div>
      </FlyerSurface>

      <FlyerSurface className="overflow-hidden">
        <dl className="grid sm:grid-cols-2">
          {[
            [t('match_number'), String(match.matchNumber)],
            [t('phase'), phaseLabel(match, t)],
            [t('status'), statusLabel(match.matchStatus, t)],
            [t('played_at'), playedAt],
            [t('group'), match.group?.name ?? t('not_set')],
            [t('round_slot'), match.roundSlot?.toString() ?? t('not_set')],
          ].map(([label, value]) => (
            <div
              className="border-b border-[var(--brand-line)] px-6 py-5 odd:sm:border-r"
              key={label}
            >
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand-gray)]">
                {label}
              </dt>
              <dd className="mt-1 font-semibold text-[var(--brand-ink)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </FlyerSurface>
    </main>
  );
}
