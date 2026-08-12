import { notFound } from 'next/navigation';
import { getScopedI18n } from '@/app/i18n/server';
import {
  getTeamById,
  getStandingsByGroup,
  getPostGroupMatchesByTeam,
  getOverallStandings,
  type TeamStanding,
  type MatchEntry,
} from '@/lib/strapi/tournament';
import FlyerSurface from '@/lib/components/FlyerSurface';
import SectionHeader from '@/lib/components/SectionHeader';
import FlyerButtonLink from '@/lib/components/FlyerButtonLink';
import TeamName from '@/lib/components/TeamName';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resultBadge(
  result: MatchEntry['result'],
  t: TFn,
): { label: string; className: string } {
  if (result === 'win')
    return {
      label: t('match_result_win'),
      className: 'bg-emerald-600 text-white',
    };
  if (result === 'draw')
    return {
      label: t('match_result_draw'),
      className: 'bg-amber-500 text-white',
    };
  if (result === 'loss')
    return {
      label: t('match_result_loss'),
      className: 'bg-[var(--brand-red)] text-white',
    };
  return {
    label: t('match_scheduled'),
    className: 'border border-[rgba(28,28,28,0.14)] text-[var(--brand-gray)]',
  };
}

function roundLabel(match: MatchEntry, t: TFn): string | null {
  if (match.phase === 'quarterfinal') {
    return match.roundSlot
      ? `${t('round_quarterfinal')} ${match.roundSlot}`
      : t('round_quarterfinal');
  }
  if (match.phase === 'semifinal') {
    return match.roundSlot
      ? `${t('round_semifinal')} ${match.roundSlot}`
      : t('round_semifinal');
  }
  if (match.phase === 'third_place') return t('round_third_place');
  if (match.phase === 'final') return t('round_final');
  if (match.phase === 'lucky_second_playoff') return t('round_playoff');
  return null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type TFn = (key: string) => string;

function includePostGroupMatches(
  standing: TeamStanding,
  matches: MatchEntry[],
): TeamStanding {
  const completed = matches.filter(
    (match) =>
      match.status === 'completed' &&
      match.goalsScored !== null &&
      match.goalsConceded !== null,
  );
  const goalsFor = completed.reduce(
    (sum, match) => sum + (match.goalsScored ?? 0),
    standing.goalsFor,
  );
  const goalsAgainst = completed.reduce(
    (sum, match) => sum + (match.goalsConceded ?? 0),
    standing.goalsAgainst,
  );

  return {
    ...standing,
    played: standing.played + completed.length,
    won:
      standing.won + completed.filter((match) => match.result === 'win').length,
    drawn:
      standing.drawn +
      completed.filter((match) => match.result === 'draw').length,
    lost:
      standing.lost +
      completed.filter((match) => match.result === 'loss').length,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points:
      standing.points +
      completed.reduce((sum, match) => sum + (match.points ?? 0), 0),
    penaltyPoints:
      standing.penaltyPoints +
      completed.reduce((sum, match) => sum + match.penaltyPoints, 0),
  };
}

function GroupStandingsTable({
  standing,
  allStandings,
  t,
  championTeamId,
}: {
  standing: TeamStanding;
  allStandings: TeamStanding[];
  t: TFn;
  championTeamId: number | undefined;
}) {
  const cols = [
    { key: 'teamName', label: '' },
    { key: 'played', label: t('standings_played') },
    { key: 'won', label: t('standings_won') },
    { key: 'drawn', label: t('standings_drawn') },
    { key: 'lost', label: t('standings_lost') },
    { key: 'goalsFor', label: t('standings_gf') },
    { key: 'goalsAgainst', label: t('standings_ga') },
    { key: 'goalDifference', label: t('standings_gd') },
    { key: 'points', label: t('standings_pts') },
    { key: 'penaltyPoints', label: t('standings_penalty_points') },
  ] as const;

  return (
    <div className="overflow-x-auto rounded-[1.25rem] border border-[rgba(28,28,28,0.08)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[rgba(28,28,28,0.08)] bg-[var(--surface-muted)]">
            {cols.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-bold uppercase tracking-[0.1em] text-[var(--brand-gray)] ${col.key === 'teamName' ? 'text-left' : 'text-center'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allStandings.map((row, i) => {
            const isCurrentTeam = row.teamId === standing.teamId;
            return (
              <tr
                key={row.teamId}
                className={`border-b border-[rgba(28,28,28,0.06)] last:border-0 ${isCurrentTeam ? 'bg-[rgba(214,34,31,0.05)] font-semibold' : 'bg-white'}`}
              >
                <td className="px-4 py-3 text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center text-xs text-[var(--brand-gray)]">
                      {i + 1}.
                    </span>
                    <span
                      className={
                        isCurrentTeam
                          ? 'text-[var(--brand-red)]'
                          : 'text-[var(--brand-ink)]'
                      }
                    >
                      <TeamName
                        championLabel={t('champion')}
                        isChampion={row.teamId === championTeamId}
                        name={row.teamName}
                      />
                    </span>
                  </div>
                </td>
                {(
                  [
                    'played',
                    'won',
                    'drawn',
                    'lost',
                    'goalsFor',
                    'goalsAgainst',
                    'goalDifference',
                    'points',
                    'penaltyPoints',
                  ] as const
                ).map((key) => (
                  <td
                    key={key}
                    className={`px-4 py-3 text-center tabular-nums ${key === 'points' ? 'font-bold text-[var(--brand-ink)]' : 'text-[var(--brand-gray)]'}`}
                  >
                    {row[key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatchRow({
  match,
  t,
  championTeamId,
}: {
  match: MatchEntry;
  t: TFn;
  championTeamId: number | undefined;
}) {
  const { label, className } = resultBadge(match.result, t);
  const knockoutRound = roundLabel(match, t);
  const teamLabel =
    match.teamNumber === 1 ? t('match_team_1') : t('match_team_2');

  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-[rgba(28,28,28,0.08)] bg-white px-5 py-4 shadow-[0_6px_16px_rgba(28,28,28,0.05)]">
      <div className="flex min-w-0 flex-col gap-1">
        {knockoutRound ? (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-red)]">
            {knockoutRound}
          </p>
        ) : null}
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[rgba(28,28,28,0.12)] px-2 py-0.5 text-xs font-bold uppercase tracking-[0.1em] text-[var(--brand-gray)]">
            #{match.matchNumber} · {teamLabel}
          </span>
        </div>
        <p className="truncate text-sm font-semibold text-[var(--brand-ink)]">
          {t('match_vs')}{' '}
          <TeamName
            championLabel={t('champion')}
            isChampion={match.opponent.teamId === championTeamId}
            name={match.opponent.teamName}
          />
        </p>
        {match.playedAt && (
          <p className="text-xs text-[var(--brand-gray)]">
            {new Date(match.playedAt).toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {match.goalsScored !== null && match.goalsConceded !== null ? (
          <p className="font-mono text-xl font-bold text-[var(--brand-ink)]">
            {match.goalsScored}:{match.goalsConceded}
          </p>
        ) : null}
        {match.status === 'completed' ? (
          <p className="text-xs font-semibold text-[var(--brand-gray)]">
            {t('match_penalty_points')}: {match.penaltyPoints}
          </p>
        ) : null}
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-[0.08em] ${className}`}
        >
          {match.points !== null ? `+${match.points} · ` : ''}
          {label}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const t = await getScopedI18n('team_detail');
  const tFn: TFn = (key) => t(key as Parameters<typeof t>[0]);

  const team = await getTeamById(id);
  if (!team) notFound();

  const [groupStandings, postGroupMatchesByTeam, overallStandings] =
    await Promise.all([
      team.group ? getStandingsByGroup(team.group.id) : [],
      getPostGroupMatchesByTeam(),
      getOverallStandings(),
    ]);
  const championTeamId = overallStandings.find(
    (standing) => standing.isChampion,
  )?.teamId;

  const rawGroupData = groupStandings[0] ?? null;
  const groupData = rawGroupData
    ? {
        ...rawGroupData,
        standings: rawGroupData.standings
          .map((standing) =>
            includePostGroupMatches(
              standing,
              postGroupMatchesByTeam.get(standing.teamId) ?? [],
            ),
          )
          .sort(
            (first, second) =>
              second.points - first.points ||
              first.penaltyPoints - second.penaltyPoints ||
              second.goalDifference - first.goalDifference ||
              second.goalsFor - first.goalsFor ||
              first.teamName.localeCompare(second.teamName),
          ),
      }
    : null;
  const teamStanding = groupData?.standings.find((s) => s.teamId === team.id);
  const postGroupMatches = postGroupMatchesByTeam.get(team.id) ?? [];
  const playoffMatches = postGroupMatches.filter(
    (match) => match.phase === 'lucky_second_playoff',
  );
  const knockoutMatches = postGroupMatches.filter(
    (match) => match.phase !== 'lucky_second_playoff',
  );

  const nationality =
    team.nationality === 'NL'
      ? t('nationality_NL')
      : team.nationality === 'DE'
        ? t('nationality_DE')
        : team.nationality;

  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      {/* Hero */}
      <FlyerSurface
        className="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
        revealDelay={0}
      >
        <FlyerButtonLink
          href={`/${locale}/teams`}
          variant="secondary"
          className="align-self-start mb-6 sm:mt-0"
        >
          ← {t('back_to_teams')}
        </FlyerButtonLink>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
              {t('eyebrow')}
            </p>
            <h1 className="mt-3 font-mono text-4xl font-semibold uppercase text-[var(--brand-ink)] sm:text-5xl">
              <TeamName
                championLabel={t('champion')}
                isChampion={team.id === championTeamId}
                name={team.name}
              />
            </h1>

            <div className="mt-4 flex flex-wrap gap-3">
              <span className="flyer-outline-pill">
                {t('nationality_label')}: {nationality}
              </span>
              {team.group && (
                <span className="flyer-outline-pill">
                  {t('group_label')}: {team.group.name}
                </span>
              )}
              {teamStanding && (
                <span className="flyer-pill">
                  {teamStanding.points} {t('standings_pts')}
                </span>
              )}
            </div>
          </div>
        </div>
      </FlyerSurface>

      {/* Standings */}
      {groupData && teamStanding && (
        <FlyerSurface className="p-6 sm:p-8" revealDelay={1}>
          <SectionHeader
            eyebrow={groupData.groupName}
            title={t('standings_title')}
          />
          <div className="mt-6">
            <GroupStandingsTable
              standing={teamStanding}
              allStandings={groupData.standings}
              championTeamId={championTeamId}
              t={tFn}
            />
          </div>

          {/* Mini stat strip */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {[
              { value: teamStanding.played, label: t('standings_played') },
              { value: teamStanding.won, label: t('standings_won') },
              { value: teamStanding.drawn, label: t('standings_drawn') },
              { value: teamStanding.lost, label: t('standings_lost') },
              {
                value: teamStanding.penaltyPoints,
                label: t('standings_penalty_points'),
              },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-[1.25rem] border border-[rgba(28,28,28,0.08)] bg-white p-4 text-center shadow-[0_8px_20px_rgba(28,28,28,0.06)]"
              >
                <p className="font-mono text-3xl font-bold text-[var(--brand-ink)]">
                  {value}
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand-gray)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </FlyerSurface>
      )}

      {/* Matches */}
      {teamStanding && teamStanding.matches.length > 0 && (
        <FlyerSurface className="p-6 sm:p-8" revealDelay={2}>
          <SectionHeader
            eyebrow={team.group?.name ?? ''}
            title={t('matches_title')}
          />
          <div className="mt-6 flex flex-col gap-3">
            {teamStanding.matches.map((match) => (
              <MatchRow
                championTeamId={championTeamId}
                key={match.matchId}
                match={match}
                t={tFn}
              />
            ))}
          </div>
        </FlyerSurface>
      )}

      {playoffMatches.length > 0 && (
        <FlyerSurface className="p-6 sm:p-8" revealDelay={3}>
          <SectionHeader
            eyebrow={t('playoff_matches_eyebrow')}
            title={t('playoff_matches_title')}
          />
          <div className="mt-6 flex flex-col gap-3">
            {playoffMatches.map((match) => (
              <MatchRow
                championTeamId={championTeamId}
                key={match.matchId}
                match={match}
                t={tFn}
              />
            ))}
          </div>
        </FlyerSurface>
      )}

      {knockoutMatches.length > 0 && (
        <FlyerSurface className="p-6 sm:p-8" revealDelay={3}>
          <SectionHeader
            eyebrow={t('knockout_matches_eyebrow')}
            title={t('knockout_matches_title')}
          />
          <div className="mt-6 flex flex-col gap-3">
            {knockoutMatches.map((match) => (
              <MatchRow
                championTeamId={championTeamId}
                key={match.matchId}
                match={match}
                t={tFn}
              />
            ))}
          </div>
        </FlyerSurface>
      )}
    </main>
  );
}
