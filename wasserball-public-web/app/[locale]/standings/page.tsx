import Link from 'next/link';
import { getCurrentLocale, getScopedI18n } from '@/app/i18n/server';
import FlyerSurface from '@/lib/components/FlyerSurface';
import PageHero from '@/lib/components/PageHero';
import TeamName from '@/lib/components/TeamName';
import SponsorAdvertisement from '@/lib/components/SponsorAdvertisement';
import {
  getAllStandings,
  getAllTeams,
  getOverallStandings,
  type StrapiTeam,
  type TeamStanding,
} from '@/lib/strapi/tournament';

export const dynamic = 'force-dynamic';

type OverallStanding = Pick<
  TeamStanding,
  | 'teamId'
  | 'teamName'
  | 'groupName'
  | 'played'
  | 'won'
  | 'drawn'
  | 'lost'
  | 'goalsFor'
  | 'goalsAgainst'
  | 'goalDifference'
  | 'points'
  | 'penaltyPoints'
  | 'isChampion'
  | 'finalPosition'
> & {
  documentId: string;
};

function emptyStanding(team: StrapiTeam): OverallStanding {
  return {
    teamId: team.id,
    documentId: team.documentId,
    teamName: team.name,
    groupName: team.group?.name ?? '–',
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    penaltyPoints: 0,
    isChampion: false,
    finalPosition: null,
  };
}

function compareStandings(first: OverallStanding, second: OverallStanding) {
  const firstPosition = first.finalPosition ?? null;
  const secondPosition = second.finalPosition ?? null;

  if (firstPosition !== null || secondPosition !== null) {
    if (firstPosition === null) return 1;
    if (secondPosition === null) return -1;
    return firstPosition - secondPosition;
  }

  return (
    second.points - first.points ||
    second.goalDifference - first.goalDifference ||
    second.goalsFor - first.goalsFor ||
    first.teamName.localeCompare(second.teamName)
  );
}

export default async function StandingsPage() {
  const locale = await getCurrentLocale();
  const t = await getScopedI18n('standings');
  const [teams, groups, overallStandings] = await Promise.all([
    getAllTeams(),
    getAllStandings(),
    getOverallStandings(),
  ]);
  const teamsById = new Map(teams.map((team) => [team.id, team]));
  const standingsByTeam = new Map(
    overallStandings.map((standing) => [standing.teamId, standing]),
  );
  const table = teams
    .map((team): OverallStanding => {
      const standing = standingsByTeam.get(team.id);
      return standing
        ? {
            ...standing,
            documentId: team.documentId,
          }
        : emptyStanding(team);
    })
    .sort(compareStandings);
  const groupTables = groups
    .map((group) => ({
      groupId: group.groupId,
      groupName: group.groupName,
      standings: group.standings
        .flatMap((standing): OverallStanding[] => {
          const team = teamsById.get(standing.teamId);
          return team
            ? [
                {
                  ...standing,
                  documentId: team.documentId,
                },
              ]
            : [];
        })
        .sort(compareStandings),
    }))
    .sort((first, second) => first.groupName.localeCompare(second.groupName));

  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <SponsorAdvertisement />

      <FlyerSurface className="overflow-hidden">
        {table.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="bg-[var(--brand-ink)] text-white">
                <tr>
                  <th className="w-14 px-4 py-4 text-center" scope="col">
                    {t('position_short')}
                  </th>
                  <th className="px-4 py-4 text-left" scope="col">
                    {t('team')}
                  </th>
                  <th className="px-3 py-4 text-left" scope="col">
                    {t('group')}
                  </th>
                  {(
                    [
                      'played',
                      'won',
                      'drawn',
                      'lost',
                      'goalsFor',
                      'goalsAgainst',
                      'goalDifference',
                    ] as const
                  ).map((column) => (
                    <th
                      className="px-3 py-4 text-center"
                      key={column}
                      scope="col"
                    >
                      <span className="sr-only">{t(column)}</span>
                      <span aria-hidden="true">{t(`${column}_short`)}</span>
                    </th>
                  ))}
                  <th className="px-4 py-4 text-center" scope="col">
                    {t('points_short')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--brand-line)]">
                {table.map((standing, index) => (
                  <tr
                    className="bg-white/55 hover:bg-white"
                    key={standing.teamId}
                  >
                    <td className="px-4 py-4 text-center font-mono text-lg font-bold text-[var(--brand-red)]">
                      {index + 1}
                    </td>
                    <th className="px-4 py-4 text-left" scope="row">
                      <Link
                        className="font-semibold text-[var(--brand-ink)] hover:text-[var(--brand-red)]"
                        href={`/${locale}/teams/${standing.documentId}`}
                      >
                        <TeamName
                          championLabel={t('champion')}
                          isChampion={standing.isChampion}
                          name={standing.teamName}
                        />
                      </Link>
                    </th>
                    <td className="px-3 py-4 text-[var(--brand-gray)]">
                      {standing.groupName}
                    </td>
                    <td className="px-3 py-4 text-center">{standing.played}</td>
                    <td className="px-3 py-4 text-center">{standing.won}</td>
                    <td className="px-3 py-4 text-center">{standing.drawn}</td>
                    <td className="px-3 py-4 text-center">{standing.lost}</td>
                    <td className="px-3 py-4 text-center">
                      {standing.goalsFor}
                    </td>
                    <td className="px-3 py-4 text-center">
                      {standing.goalsAgainst}
                    </td>
                    <td className="px-3 py-4 text-center">
                      {standing.goalDifference > 0 ? '+' : ''}
                      {standing.goalDifference}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex min-w-10 justify-center rounded-full bg-[var(--brand-red)] px-3 py-1 font-bold text-white">
                        {standing.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-[var(--brand-gray)]">
            {t('empty')}
          </p>
        )}
      </FlyerSurface>

      <p className="text-sm text-[var(--brand-gray)]">{t('ranking_hint')}</p>

      {groupTables.length > 0 ? (
        <section
          className="flex flex-col gap-6"
          aria-labelledby="group-standings-title"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-red)]">
              {t('group_eyebrow')}
            </p>
            <h2
              className="mt-2 font-mono text-3xl font-semibold uppercase text-[var(--brand-ink)] sm:text-4xl"
              id="group-standings-title"
            >
              {t('group_title')}
            </h2>
            <p className="mt-3 max-w-3xl text-[var(--brand-gray)]">
              {t('group_description')}
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {groupTables.map((group) => (
              <FlyerSurface className="overflow-hidden" key={group.groupId}>
                <div className="border-b border-[var(--brand-line)] bg-[var(--surface-muted)] px-5 py-4 sm:px-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                    {t('group')}
                  </p>
                  <h3 className="mt-1 font-mono text-2xl font-semibold uppercase text-[var(--brand-ink)]">
                    {group.groupName}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[570px] border-collapse text-sm">
                    <thead className="bg-[var(--brand-ink)] text-white">
                      <tr>
                        <th className="w-12 px-3 py-3 text-center" scope="col">
                          {t('position_short')}
                        </th>
                        <th className="px-3 py-3 text-left" scope="col">
                          {t('team')}
                        </th>
                        {(
                          [
                            'played',
                            'won',
                            'drawn',
                            'lost',
                            'goalDifference',
                          ] as const
                        ).map((column) => (
                          <th
                            className="px-2 py-3 text-center"
                            key={column}
                            scope="col"
                          >
                            <span className="sr-only">{t(column)}</span>
                            <span aria-hidden="true">
                              {t(`${column}_short`)}
                            </span>
                          </th>
                        ))}
                        <th className="px-3 py-3 text-center" scope="col">
                          {t('points_short')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--brand-line)]">
                      {group.standings.map((standing, index) => (
                        <tr
                          className="bg-white/55 hover:bg-white"
                          key={standing.teamId}
                        >
                          <td className="px-3 py-3 text-center font-mono font-bold text-[var(--brand-red)]">
                            {index + 1}
                          </td>
                          <th className="px-3 py-3 text-left" scope="row">
                            <Link
                              className="font-semibold text-[var(--brand-ink)] hover:text-[var(--brand-red)]"
                              href={`/${locale}/teams/${standing.documentId}`}
                            >
                              <TeamName
                                championLabel={t('champion')}
                                isChampion={
                                  standingsByTeam.get(standing.teamId)
                                    ?.isChampion ?? false
                                }
                                name={standing.teamName}
                              />
                            </Link>
                          </th>
                          <td className="px-2 py-3 text-center">
                            {standing.played}
                          </td>
                          <td className="px-2 py-3 text-center">
                            {standing.won}
                          </td>
                          <td className="px-2 py-3 text-center">
                            {standing.drawn}
                          </td>
                          <td className="px-2 py-3 text-center">
                            {standing.lost}
                          </td>
                          <td className="px-2 py-3 text-center">
                            {standing.goalDifference > 0 ? '+' : ''}
                            {standing.goalDifference}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-[var(--brand-ink)]">
                            {standing.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </FlyerSurface>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
