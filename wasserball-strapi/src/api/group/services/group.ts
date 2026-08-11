import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

const { ValidationError } = errors;

type TeamRecord = {
  id: number;
  name: string;
  isPresent: boolean;
};

type GroupRecord = {
  id: number;
  name: string;
  teams?: TeamRecord[];
};

type GroupMatchRecord = {
  id: number;
  matchNumber?: number;
  phase?: string;
  matchStatus?: string;
  group?: { id: number } | null;
  homeTeam?: { id: number } | null;
  awayTeam?: { id: number } | null;
};

type GenerationResult = {
  createdMatches: number;
  skippedMatches: number;
  cancelledMatches: number;
  reactivatedMatches: number;
};

function toPairKey(groupId: number, homeTeamId: number, awayTeamId: number) {
  const [first, second] = [homeTeamId, awayTeamId].sort((a, b) => a - b);
  return `${groupId}:${first}-${second}`;
}

function buildRoundRobinPairs(teams: TeamRecord[]) {
  const result: Array<[TeamRecord, TeamRecord]> = [];
  for (let first = 0; first < teams.length; first += 1) {
    for (let second = first + 1; second < teams.length; second += 1) {
      result.push([teams[first], teams[second]]);
    }
  }
  return result;
}

export default factories.createCoreService("api::group.group", ({ strapi }) => ({
  async generateGroupPhaseMatches(): Promise<GenerationResult> {
    const groups = (await strapi.entityService.findMany("api::group.group", {
      fields: ["id", "name"],
      populate: {
        teams: {
          fields: ["id", "name", "isPresent"],
        },
      },
      sort: ["name:asc"],
      limit: 100,
    })) as GroupRecord[];

    if (groups.length !== 4) {
      throw new ValidationError(
        `Expected exactly 4 groups, but found ${groups.length}.`,
      );
    }

    for (const group of groups) {
      const teams = (group.teams ?? []).filter(
        (team) => team.isPresent !== false,
      );
      if (teams.length < 2) {
        throw new ValidationError(
          `Group "${group.name}" needs at least 2 present teams, but has ${teams.length}.`,
        );
      }
      if (teams.length > 4) {
        throw new ValidationError(
          `Group "${group.name}" supports at most 4 present teams, but has ${teams.length}.`,
        );
      }
    }

    const existingMatches = (await strapi.entityService.findMany(
      "api::group-match.group-match",
      {
        filters: { phase: "group_phase" },
        fields: ["id", "matchNumber", "phase", "matchStatus"],
        populate: {
          group: {
            fields: ["id"],
          },
          homeTeam: {
            fields: ["id"],
          },
          awayTeam: {
            fields: ["id"],
          },
        },
        limit: 500,
      },
    )) as GroupMatchRecord[];

    const existingMatchesByPair = new Map<string, GroupMatchRecord>();
    let maxMatchNumber = 0;

    for (const match of existingMatches) {
      if (typeof match.matchNumber === "number") {
        maxMatchNumber = Math.max(maxMatchNumber, match.matchNumber);
      }

      if (!match.group?.id || !match.homeTeam?.id || !match.awayTeam?.id) {
        continue;
      }

      existingMatchesByPair.set(
        toPairKey(match.group.id, match.homeTeam.id, match.awayTeam.id),
        match,
      );
    }

    const desiredPairKeys = new Set<string>();
    for (const group of groups) {
      const presentTeams = (group.teams ?? []).filter(
        (team) => team.isPresent !== false,
      );
      for (const [team1, team2] of buildRoundRobinPairs(presentTeams)) {
        desiredPairKeys.add(toPairKey(group.id, team1.id, team2.id));
      }
    }

    const completedMatchesForAbsentTeams = [...existingMatchesByPair].filter(
      ([pairKey, match]) =>
        !desiredPairKeys.has(pairKey) && match.matchStatus === "completed",
    );
    if (completedMatchesForAbsentTeams.length > 0) {
      throw new ValidationError(
        "Present-team changes would remove already completed group matches. Revert the attendance change or correct those matches manually.",
      );
    }

    let createdMatches = 0;
    let skippedMatches = 0;
    let cancelledMatches = 0;
    let reactivatedMatches = 0;

    for (const [pairKey, match] of existingMatchesByPair) {
      if (desiredPairKeys.has(pairKey) || match.matchStatus === "cancelled") {
        continue;
      }
      await strapi.entityService.update("api::group-match.group-match", match.id, {
        data: { matchStatus: "cancelled" } as any,
      });
      cancelledMatches += 1;
    }

    for (const group of groups) {
      const teams = (group.teams ?? []).filter(
        (team) => team.isPresent !== false,
      );
      for (const [homeTeam, awayTeam] of buildRoundRobinPairs(teams)) {
        const pairKey = toPairKey(group.id, homeTeam.id, awayTeam.id);

        const existingMatch = existingMatchesByPair.get(pairKey);
        if (existingMatch) {
          if (existingMatch.matchStatus === "cancelled") {
            await strapi.entityService.update(
              "api::group-match.group-match",
              existingMatch.id,
              { data: { matchStatus: "scheduled" } as any },
            );
            reactivatedMatches += 1;
          } else {
            skippedMatches += 1;
          }
          continue;
        }

        maxMatchNumber += 1;
        await strapi.entityService.create("api::group-match.group-match", {
          data: {
            matchNumber: maxMatchNumber,
            phase: "group_phase",
            matchStatus: "scheduled",
            group: group.id,
            homeTeam: homeTeam.id,
            awayTeam: awayTeam.id,
          },
        });

        existingMatchesByPair.set(pairKey, { id: 0 });
        createdMatches += 1;
      }
    }

    return {
      createdMatches,
      skippedMatches,
      cancelledMatches,
      reactivatedMatches,
    };
  },
}));
