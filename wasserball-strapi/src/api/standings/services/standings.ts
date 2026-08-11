const POINTS_WIN = 5;
const POINTS_DRAW = 3;
const POINTS_LOSS = 0;

type TeamRef = {
  id: number;
  name: string;
  nationality: string;
};

type GroupRef = {
  id: number;
  name: string;
};

type GroupMatchRecord = {
  id: number;
  matchNumber: number;
  matchStatus: string;
  playedAt: string | null;
  homeScore: number | null;
  awayScore: number | null;
  team1PenaltyPoints: number;
  team2PenaltyPoints: number;
  group: GroupRef | null;
  homeTeam: TeamRef | null;
  awayTeam: TeamRef | null;
};

export type MatchEntry = {
  matchId: number;
  matchNumber: number;
  phase: "group_phase";
  status: string;
  playedAt: string | null;
  opponent: { teamId: number; teamName: string; nationality: string };
  teamNumber: 1 | 2;
  goalsScored: number | null;
  goalsConceded: number | null;
  result: "win" | "draw" | "loss" | null;
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
  matches: MatchEntry[];
};

export type GroupStandings = {
  groupId: number;
  groupName: string;
  standings: TeamStanding[];
};

function emptyStanding(team: TeamRef, group: GroupRef): TeamStanding {
  return {
    teamId: team.id,
    teamName: team.name,
    nationality: team.nationality,
    groupId: group.id,
    groupName: group.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    penaltyPoints: 0,
    matches: [],
  };
}

function matchResult(
  goalsFor: number,
  goalsAgainst: number,
): { result: "win" | "draw" | "loss"; points: number } {
  if (goalsFor > goalsAgainst) return { result: "win", points: POINTS_WIN };
  if (goalsFor === goalsAgainst) return { result: "draw", points: POINTS_DRAW };
  return { result: "loss", points: POINTS_LOSS };
}

function applyCompletedMatch(
  standing: TeamStanding,
  match: GroupMatchRecord,
  opponent: TeamRef,
  teamNumber: 1 | 2,
  goalsFor: number,
  goalsAgainst: number,
  penaltyPoints: number,
) {
  standing.played += 1;
  standing.goalsFor += goalsFor;
  standing.goalsAgainst += goalsAgainst;
  standing.goalDifference = standing.goalsFor - standing.goalsAgainst;

  const { result, points } = matchResult(goalsFor, goalsAgainst);

  if (result === "win") standing.won += 1;
  else if (result === "draw") standing.drawn += 1;
  else standing.lost += 1;

  standing.points += points;
  standing.penaltyPoints += penaltyPoints;

  standing.matches.push({
    matchId: match.id,
    matchNumber: match.matchNumber,
    phase: "group_phase",
    status: match.matchStatus,
    playedAt: match.playedAt,
    opponent: { teamId: opponent.id, teamName: opponent.name, nationality: opponent.nationality },
    teamNumber,
    goalsScored: goalsFor,
    goalsConceded: goalsAgainst,
    result,
    points,
    penaltyPoints,
  });
}

function applyScheduledMatch(
  standing: TeamStanding,
  match: GroupMatchRecord,
  opponent: TeamRef,
  teamNumber: 1 | 2,
) {
  standing.matches.push({
    matchId: match.id,
    matchNumber: match.matchNumber,
    phase: "group_phase",
    status: match.matchStatus,
    playedAt: match.playedAt,
    opponent: { teamId: opponent.id, teamName: opponent.name, nationality: opponent.nationality },
    teamNumber,
    goalsScored: null,
    goalsConceded: null,
    result: null,
    points: null,
    penaltyPoints: 0,
  });
}

function sortStandings(standings: TeamStanding[]): TeamStanding[] {
  return [...standings].sort(
    (a, b) =>
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.teamName.localeCompare(b.teamName),
  );
}

type EntityService = {
  findMany: (uid: string, params: Record<string, unknown>) => Promise<unknown>;
};

type StrapiLike = {
  entityService: EntityService;
};

export async function computeStandings(
  strapi: StrapiLike,
  groupId?: number,
): Promise<GroupStandings[]> {
  const filters: Record<string, unknown> = {};
  if (groupId !== undefined) {
    filters.group = groupId;
  }

  const matches = (await strapi.entityService.findMany(
    "api::group-match.group-match",
    {
      filters,
      populate: {
        group: { fields: ["id", "name"] },
        homeTeam: { fields: ["id", "name", "nationality"] },
        awayTeam: { fields: ["id", "name", "nationality"] },
      },
      sort: ["matchNumber:asc"],
      limit: 500,
    },
  )) as GroupMatchRecord[];

  // groupId -> { group, teams: teamId -> TeamStanding }
  const groupMap = new Map<
    number,
    { group: GroupRef; teams: Map<number, TeamStanding> }
  >();

  for (const match of matches) {
    if (match.matchStatus === "cancelled") {
      continue;
    }

    if (!match.group || !match.homeTeam || !match.awayTeam) {
      continue;
    }

    const group = match.group;

    if (!groupMap.has(group.id)) {
      groupMap.set(group.id, { group, teams: new Map() });
    }

    const { teams } = groupMap.get(group.id)!;

    if (!teams.has(match.homeTeam.id)) {
      teams.set(match.homeTeam.id, emptyStanding(match.homeTeam, group));
    }
    if (!teams.has(match.awayTeam.id)) {
      teams.set(match.awayTeam.id, emptyStanding(match.awayTeam, group));
    }

    const isCompleted =
      match.matchStatus === "completed" &&
      match.homeScore !== null &&
      match.awayScore !== null;

    if (isCompleted) {
      applyCompletedMatch(
        teams.get(match.homeTeam.id)!,
        match,
        match.awayTeam,
        1,
        match.homeScore!,
        match.awayScore!,
        match.team1PenaltyPoints ?? 0,
      );
      applyCompletedMatch(
        teams.get(match.awayTeam.id)!,
        match,
        match.homeTeam,
        2,
        match.awayScore!,
        match.homeScore!,
        match.team2PenaltyPoints ?? 0,
      );
    } else {
      applyScheduledMatch(teams.get(match.homeTeam.id)!, match, match.awayTeam, 1);
      applyScheduledMatch(teams.get(match.awayTeam.id)!, match, match.homeTeam, 2);
    }
  }

  return [...groupMap.values()]
    .map(({ group, teams }) => ({
      groupId: group.id,
      groupName: group.name,
      standings: sortStandings([...teams.values()]),
    }))
    .sort((a, b) => a.groupName.localeCompare(b.groupName));
}
