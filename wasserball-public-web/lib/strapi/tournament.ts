import { getStrapiContent } from './api';

// ---------------------------------------------------------------------------
// Types matching the Strapi API shapes
// ---------------------------------------------------------------------------

export type StrapiGroup = {
  id: number;
  name: string;
};

export type StrapiTeam = {
  id: number;
  documentId: string;
  name: string;
  nationality: 'NL' | 'DE';
  isPresent?: boolean;
  group: StrapiGroup | null;
};

export type MatchEntry = {
  matchId: number;
  matchNumber: number;
  roundSlot: number | null;
  phase:
    | 'group_phase'
    | 'lucky_second_playoff'
    | 'quarterfinal'
    | 'semifinal'
    | 'third_place'
    | 'final';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  playedAt: string | null;
  opponent: { teamId: number; teamName: string; nationality: string };
  teamNumber: 1 | 2;
  goalsScored: number | null;
  goalsConceded: number | null;
  result: 'win' | 'draw' | 'loss' | null;
  points: number | null;
  penaltyPoints: number;
};

export type TeamStanding = {
  teamId: number;
  teamName: string;
  nationality: string;
  groupId: number;
  groupName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  penaltyPoints: number;
  isChampion: boolean;
  finalPosition?: 1 | 2 | 3 | 4 | null;
  matches: MatchEntry[];
};

export type GroupStandings = {
  groupId: number;
  groupName: string;
  standings: TeamStanding[];
};

export type StrapiMatch = {
  id: number;
  documentId: string;
  matchLabel: string | null;
  matchNumber: number;
  roundSlot: number | null;
  phase: MatchEntry['phase'];
  matchStatus: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  playedAt: string | null;
  homeScore: number | null;
  awayScore: number | null;
  team1PenaltyPoints: number | null;
  team2PenaltyPoints: number | null;
  homeTeam: StrapiTeam | null;
  awayTeam: StrapiTeam | null;
  group: StrapiGroup | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------

export async function getAllTeams(): Promise<StrapiTeam[]> {
  const teams = await getStrapiContent<StrapiTeam[]>('teams', {
    'populate[group]': 'true',
    'pagination[limit]': '100',
    sort: 'name:asc',
  });
  return teams ?? [];
}

export async function getTeamById(
  documentId: string,
): Promise<StrapiTeam | null> {
  try {
    return await getStrapiContent<StrapiTeam>(`teams/${documentId}`, {
      'populate[group]': 'true',
    });
  } catch {
    return null;
  }
}

export async function getAllStandings(): Promise<GroupStandings[]> {
  const result = await getStrapiContent<GroupStandings[]>('standings');
  return result ?? [];
}

export async function getOverallStandings(): Promise<TeamStanding[]> {
  const result = await getStrapiContent<TeamStanding[]>('standings/overall');
  return result ?? [];
}

export async function getStandingsByGroup(
  groupId: number,
): Promise<GroupStandings[]> {
  const result = await getStrapiContent<GroupStandings[]>('standings', {
    groupId: String(groupId),
  });
  return result ?? [];
}

export async function getMatchById(id: number): Promise<StrapiMatch | null> {
  const matches = await getStrapiContent<StrapiMatch[]>('group-matches', {
    'filters[id][$eq]': String(id),
    'populate[group]': 'true',
    'populate[homeTeam]': 'true',
    'populate[awayTeam]': 'true',
    'pagination[limit]': '1',
  });
  return matches?.[0] ?? null;
}

export async function getAllMatches(): Promise<StrapiMatch[]> {
  const matches = await getStrapiContent<StrapiMatch[]>('group-matches', {
    'populate[group]': 'true',
    'populate[homeTeam]': 'true',
    'populate[awayTeam]': 'true',
    'pagination[limit]': '200',
    'sort[0]': 'playedAt:asc',
    'sort[1]': 'matchNumber:asc',
  });

  return (matches ?? []).sort((first, second) => {
    if (!first.playedAt) {
      return second.playedAt ? 1 : first.matchNumber - second.matchNumber;
    }
    if (!second.playedAt) return -1;
    return (
      new Date(first.playedAt).getTime() - new Date(second.playedAt).getTime() ||
      first.matchNumber - second.matchNumber
    );
  });
}

export async function getPostGroupMatchesByTeam(): Promise<
  Map<number, MatchEntry[]>
> {
  const matches =
    (await getStrapiContent<StrapiMatch[]>('group-matches', {
      'filters[phase][$ne]': 'group_phase',
      'populate[homeTeam]': 'true',
      'populate[awayTeam]': 'true',
      'pagination[limit]': '100',
      sort: 'matchNumber:asc',
    })) ?? [];

  const byTeam = new Map<number, MatchEntry[]>();

  for (const match of matches) {
    if (!match.homeTeam || !match.awayTeam) continue;

    for (const teamNumber of [1, 2] as const) {
      const team = teamNumber === 1 ? match.homeTeam : match.awayTeam;
      const opponent = teamNumber === 1 ? match.awayTeam : match.homeTeam;
      const goalsScored = teamNumber === 1 ? match.homeScore : match.awayScore;
      const goalsConceded =
        teamNumber === 1 ? match.awayScore : match.homeScore;
      const penaltyPoints =
        (teamNumber === 1
          ? match.team1PenaltyPoints
          : match.team2PenaltyPoints) ?? 0;
      const isCompleted =
        match.matchStatus === 'completed' &&
        goalsScored !== null &&
        goalsConceded !== null;
      const result = !isCompleted
        ? null
        : goalsScored > goalsConceded
          ? 'win'
          : goalsScored === goalsConceded
            ? 'draw'
            : 'loss';
      const entry = {
        matchId: match.id,
        matchNumber: match.matchNumber,
        roundSlot: match.roundSlot,
        phase: match.phase,
        status: match.matchStatus,
        playedAt: match.playedAt,
        opponent: {
          teamId: opponent.id,
          teamName: opponent.name,
          nationality: opponent.nationality,
        },
        teamNumber,
        goalsScored: isCompleted ? goalsScored : null,
        goalsConceded: isCompleted ? goalsConceded : null,
        result,
        points:
          result === 'win'
            ? 3
            : result === 'draw'
              ? 1
              : result === 'loss'
                ? 0
                : null,
        penaltyPoints,
      } satisfies MatchEntry;

      byTeam.set(team.id, [...(byTeam.get(team.id) ?? []), entry]);
    }
  }

  return byTeam;
}
