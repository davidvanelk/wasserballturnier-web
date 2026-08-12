import Link from 'next/link';
import { getScopedI18n, getCurrentLocale } from '@/app/i18n/server';
import {
  getAllTeams,
  getAllStandings,
  getOverallStandings,
} from '@/lib/strapi/tournament';
import type { GroupStandings, StrapiTeam } from '@/lib/strapi/tournament';
import FlyerSurface from '@/lib/components/FlyerSurface';
import PageHero from '@/lib/components/PageHero';
import TeamName from '@/lib/components/TeamName';

export const dynamic = 'force-dynamic';

function getTeamPoints(
  teamId: number,
  standings: GroupStandings[],
): number | null {
  for (const group of standings) {
    const standing = group.standings.find((s) => s.teamId === teamId);
    if (standing) return standing.points;
  }
  return null;
}

function groupTeams(teams: StrapiTeam[]): Map<string, StrapiTeam[]> {
  const groups = new Map<string, StrapiTeam[]>();

  for (const team of teams) {
    if (!team.group) continue;
    const group = groups.get(team.group.name) ?? [];
    group.push(team);
    groups.set(team.group.name, group);
  }

  return new Map(
    [...groups.entries()].sort(([first], [second]) =>
      first.localeCompare(second),
    ),
  );
}

export default async function TeamsPage() {
  const locale = await getCurrentLocale();
  const t = await getScopedI18n('teams');
  const [teams, standings, overallStandings] = await Promise.all([
    getAllTeams(),
    getAllStandings(),
    getOverallStandings(),
  ]);
  const championTeamId = overallStandings.find(
    (standing) => standing.isChampion,
  )?.teamId;
  const hasCompleteGroupDraw =
    teams.length > 0 && teams.every((team) => team.group !== null);
  const groupedTeams = hasCompleteGroupDraw ? groupTeams(teams) : null;

  const renderTeam = (team: StrapiTeam) => {
    const points = getTeamPoints(team.id, standings);
    const nationality =
      team.nationality === 'NL'
        ? t('nationality_NL')
        : team.nationality === 'DE'
          ? t('nationality_DE')
          : team.nationality;

    return (
      <Link
        key={team.id}
        href={`/${locale}/teams/${team.documentId}`}
        className="group flex items-center justify-between gap-4 bg-white/45 px-5 py-5 hover:bg-white sm:px-8"
      >
        <div className="min-w-0">
          <h3 className="font-mono text-lg font-semibold uppercase text-[var(--brand-ink)] group-hover:text-[var(--brand-red)] sm:text-xl">
            <TeamName
              championLabel={t('champion')}
              isChampion={team.id === championTeamId}
              name={team.name}
            />
          </h3>
          <p className="mt-1 text-sm text-[var(--brand-gray)]">
            {nationality}
            {team.group ? ` · ${t('group_label')} ${team.group.name}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {points !== null ? (
            <span className="rounded-full bg-[var(--brand-red)] px-3 py-1 text-xs font-bold text-white">
              {points} {t('points_short')}
            </span>
          ) : null}
          <span
            className="text-xl text-[var(--brand-gray)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--brand-red)]"
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </Link>
    );
  };

  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
      />

      <div>
        {groupedTeams ? (
          <div className="flex flex-col gap-8">
            {[...groupedTeams.entries()].map(([groupName, teamsInGroup]) => (
              <FlyerSurface key={groupName} className="overflow-hidden">
                <div className="border-b border-[var(--brand-line)] bg-[var(--surface-muted)] px-5 py-4 sm:px-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
                    {t('group_label')}
                  </p>
                  <h2 className="mt-1 font-mono text-2xl font-semibold uppercase text-[var(--brand-ink)]">
                    {groupName}
                  </h2>
                </div>
                <div className="divide-y divide-[var(--brand-line)]">
                  {teamsInGroup.map(renderTeam)}
                </div>
              </FlyerSurface>
            ))}
          </div>
        ) : teams.length > 0 ? (
          <FlyerSurface className="overflow-hidden">
            <div className="divide-y divide-[var(--brand-line)]">
              {teams.map(renderTeam)}
            </div>
          </FlyerSurface>
        ) : (
          <FlyerSurface className="p-8 text-center text-[var(--brand-gray)]">
            {t('empty')}
          </FlyerSurface>
        )}
      </div>
    </main>
  );
}
