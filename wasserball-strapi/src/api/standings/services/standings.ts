const POINTS_WIN = 3;
const POINTS_DRAW = 1;
const POINTS_LOSS = 0;

type TeamRef = {
  id: number;
  name: string;
  nationality: string;
  isPresent: boolean;
};

type TeamWithGroup = TeamRef & {
  group: GroupRef | null;
};

type MatchPhase =
  | "group_phase"
  | "lucky_second_playoff"
  | "quarterfinal"
  | "semifinal"
  | "third_place"
  | "final";

type GroupRef = {
  id: number;
  name: string;
};

type GroupMatchRecord = {
  id: number;
  matchNumber: number;
  phase: MatchPhase;
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
  phase: MatchPhase;
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
  isChampion: boolean;
  finalPosition: 1 | 2 | 3 | 4 | null;
  matches: MatchEntry[];
};

export type GroupStandings = {
  groupId: number;
  groupName: string;
  standings: TeamStanding[];
};

function emptyStanding(team: TeamRef, group: GroupRef | null): TeamStanding {
  return {
    teamId: team.id,
    teamName: team.name,
    nationality: team.nationality,
    groupId: group?.id ?? 0,
    groupName: group?.name ?? "",
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
    phase: match.phase,
    status: match.matchStatus,
    playedAt: match.playedAt,
    opponent: {
      teamId: opponent.id,
      teamName: opponent.name,
      nationality: opponent.nationality,
    },
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
    phase: match.phase,
    status: match.matchStatus,
    playedAt: match.playedAt,
    opponent: {
      teamId: opponent.id,
      teamName: opponent.name,
      nationality: opponent.nationality,
    },
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
    (a, b) => {
      if (a.finalPosition !== null || b.finalPosition !== null) {
        if (a.finalPosition === null) return 1;
        if (b.finalPosition === null) return -1;
        return a.finalPosition - b.finalPosition;
      }

      return (
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        a.teamName.localeCompare(b.teamName)
      );
    },
  );
}

function getPlacement(
  match: GroupMatchRecord,
): { winnerId: number; loserId: number } | null {
  if (
    match.matchStatus !== "completed" ||
    !match.homeTeam ||
    !match.awayTeam ||
    match.homeScore === null ||
    match.awayScore === null ||
    match.homeScore === match.awayScore
  ) {
    return null;
  }

  return match.homeScore > match.awayScore
    ? { winnerId: match.homeTeam.id, loserId: match.awayTeam.id }
    : { winnerId: match.awayTeam.id, loserId: match.homeTeam.id };
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
  const filters: Record<string, unknown> = { phase: "group_phase" };
  if (groupId !== undefined) {
    filters.group = groupId;
  }

  const matches = (await strapi.entityService.findMany(
    "api::group-match.group-match",
    {
      filters,
      populate: {
        group: { fields: ["id", "name"] },
        homeTeam: { fields: ["id", "name", "nationality", "isPresent"] },
        awayTeam: { fields: ["id", "name", "nationality", "isPresent"] },
      },
      fields: [
        "id",
        "matchNumber",
        "phase",
        "matchStatus",
        "playedAt",
        "homeScore",
        "awayScore",
        "team1PenaltyPoints",
        "team2PenaltyPoints",
      ],
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

    let groupEntry = groupMap.get(group.id);
    if (!groupEntry) {
      groupEntry = { group, teams: new Map() };
      groupMap.set(group.id, groupEntry);
    }

    const { teams } = groupEntry;

    if (match.homeTeam.isPresent && !teams.has(match.homeTeam.id)) {
      teams.set(match.homeTeam.id, emptyStanding(match.homeTeam, group));
    }
    if (match.awayTeam.isPresent && !teams.has(match.awayTeam.id)) {
      teams.set(match.awayTeam.id, emptyStanding(match.awayTeam, group));
    }

    const homeStanding = teams.get(match.homeTeam.id);
    const awayStanding = teams.get(match.awayTeam.id);

    if (
      match.matchStatus === "completed" &&
      match.homeScore !== null &&
      match.awayScore !== null
    ) {
      if (homeStanding) {
        applyCompletedMatch(
          homeStanding,
          match,
          match.awayTeam,
          1,
          match.homeScore,
          match.awayScore,
          match.team1PenaltyPoints ?? 0,
        );
      }
      if (awayStanding) {
        applyCompletedMatch(
          awayStanding,
          match,
          match.homeTeam,
          2,
          match.awayScore,
          match.homeScore,
          match.team2PenaltyPoints ?? 0,
        );
      }
    } else {
      if (homeStanding) {
        applyScheduledMatch(homeStanding, match, match.awayTeam, 1);
      }
      if (awayStanding) {
        applyScheduledMatch(awayStanding, match, match.homeTeam, 2);
      }
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

export async function computeOverallStandings(
  strapi: StrapiLike,
): Promise<TeamStanding[]> {
  const teams = (await strapi.entityService.findMany("api::team.team", {
    filters: { isPresent: true },
    fields: ["id", "name", "nationality", "isPresent"],
    populate: { group: { fields: ["id", "name"] } },
    limit: 100,
  })) as TeamWithGroup[];
  const standings = new Map(
    teams.map((team) => [team.id, emptyStanding(team, team.group)]),
  );
  const matches = (await strapi.entityService.findMany(
    "api::group-match.group-match",
    {
      filters: {
        matchStatus: "completed",
        homeScore: { $notNull: true },
        awayScore: { $notNull: true },
      },
      fields: [
        "id",
        "matchNumber",
        "phase",
        "matchStatus",
        "playedAt",
        "homeScore",
        "awayScore",
        "team1PenaltyPoints",
        "team2PenaltyPoints",
      ],
      populate: {
        group: { fields: ["id", "name"] },
        homeTeam: { fields: ["id", "name", "nationality", "isPresent"] },
        awayTeam: { fields: ["id", "name", "nationality", "isPresent"] },
      },
      sort: ["matchNumber:asc"],
      limit: 500,
    },
  )) as GroupMatchRecord[];
  let finalPlacement: ReturnType<typeof getPlacement> = null;
  let thirdPlacePlacement: ReturnType<typeof getPlacement> = null;

  for (const match of matches) {
    if (
      !match.homeTeam ||
      !match.awayTeam ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      continue;
    }

    const homeStanding = standings.get(match.homeTeam.id);
    const awayStanding = standings.get(match.awayTeam.id);
    if (homeStanding) {
      applyCompletedMatch(
        homeStanding,
        match,
        match.awayTeam,
        1,
        match.homeScore,
        match.awayScore,
        match.team1PenaltyPoints ?? 0,
      );
    }
    if (awayStanding) {
      applyCompletedMatch(
        awayStanding,
        match,
        match.homeTeam,
        2,
        match.awayScore,
        match.homeScore,
        match.team2PenaltyPoints ?? 0,
      );
    }

    if (match.phase === "final" && match.homeScore !== match.awayScore) {
      finalPlacement = getPlacement(match);
      const champion = finalPlacement
        ? standings.get(finalPlacement.winnerId)
        : undefined;
      if (champion) champion.isChampion = true;
    } else if (match.phase === "third_place") {
      thirdPlacePlacement = getPlacement(match);
    }
  }

  if (finalPlacement && thirdPlacePlacement) {
    const placements = [
      [finalPlacement.winnerId, 1],
      [finalPlacement.loserId, 2],
      [thirdPlacePlacement.winnerId, 3],
      [thirdPlacePlacement.loserId, 4],
    ] as const;

    if (new Set(placements.map(([teamId]) => teamId)).size === 4) {
      for (const [teamId, finalPosition] of placements) {
        const standing = standings.get(teamId);
        if (standing) standing.finalPosition = finalPosition;
      }
    }
  }

  return sortStandings([...standings.values()]);
}
