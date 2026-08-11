import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";
import {
  computeStandings,
  type TeamStanding,
} from "../../standings/services/standings";

const { ValidationError } = errors;
const ADDITIONAL_QUALIFIER_COUNT = 4;

type AttendanceGroup = {
  name: string;
  teams?: Array<{ id: number; isPresent: boolean }>;
};

type MatchRecord = {
  id: number;
  matchNumber: number;
  phase: string;
  roundSlot?: number | null;
  matchStatus: string;
  homeScore: number | null;
  awayScore: number | null;
  team1PenaltyPoints: number;
  team2PenaltyPoints: number;
  homeTeam: { id: number } | null;
  awayTeam: { id: number } | null;
};

type GenerationResult = {
  status: "playoff_required" | "quarterfinals_generated";
  createdMatches: number;
  qualifiers?: Array<{ teamId: number; teamName: string; qualification: string }>;
  playoffTeams?: Array<{ teamId: number; teamName: string }>;
};

const sameQualificationScore = (a: TeamStanding, b: TeamStanding) =>
  a.points === b.points && a.penaltyPoints === b.penaltyPoints;

const qualificationSort = (a: TeamStanding, b: TeamStanding) =>
  b.points - a.points ||
  a.penaltyPoints - b.penaltyPoints ||
  b.goalDifference - a.goalDifference ||
  b.goalsFor - a.goalsFor ||
  a.teamName.localeCompare(b.teamName);

function pairs<T>(items: T[]): Array<[T, T]> {
  const result: Array<[T, T]> = [];
  for (let first = 0; first < items.length; first += 1) {
    for (let second = first + 1; second < items.length; second += 1) {
      result.push([items[first], items[second]]);
    }
  }
  return result;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, index) =>
    permutations([...items.slice(0, index), ...items.slice(index + 1)]).map(
      (rest) => [item, ...rest],
    ),
  );
}

function buildQuarterfinalPairs(
  winners: TeamStanding[],
  additionalQualifiers: TeamStanding[],
): Array<[TeamStanding, TeamStanding]> {
  const qualifierOrder = permutations(additionalQualifiers).find((order) =>
    order.every((team, index) => team.groupId !== winners[index].groupId),
  );

  if (!qualifierOrder) {
    throw new ValidationError(
      "Unable to create quarterfinals without a group-phase rematch.",
    );
  }

  return [
    [winners[0], qualifierOrder[0]],
    [winners[1], qualifierOrder[1]],
    [winners[2], qualifierOrder[2]],
    [winners[3], qualifierOrder[3]],
  ];
}

export default factories.createCoreService(
  "api::group-match.group-match",
  ({ strapi }) => ({
    async generateKnockoutRound(): Promise<GenerationResult> {
      const attendanceGroups = (await strapi.entityService.findMany(
        "api::group.group",
        {
          fields: ["name"],
          populate: { teams: { fields: ["id", "isPresent"] } },
          limit: 100,
        },
      )) as unknown as AttendanceGroup[];

      if (attendanceGroups.length !== 4) {
        throw new ValidationError(
          `Expected exactly 4 groups, but found ${attendanceGroups.length}.`,
        );
      }

      const presentTeamCounts = attendanceGroups.map((group) => ({
        name: group.name,
        count: (group.teams ?? []).filter((team) => team.isPresent !== false)
          .length,
      }));
      const invalidGroup = presentTeamCounts.find((group) => group.count < 2);
      if (invalidGroup) {
        throw new ValidationError(
          `Group "${invalidGroup.name}" needs at least 2 present teams for knockout qualification.`,
        );
      }
      const oversizedGroup = presentTeamCounts.find((group) => group.count > 4);
      if (oversizedGroup) {
        throw new ValidationError(
          `Group "${oversizedGroup.name}" supports at most 4 present teams.`,
        );
      }
      const expectedGroupMatchCount = presentTeamCounts.reduce(
        (total, group) => total + (group.count * (group.count - 1)) / 2,
        0,
      );

      const groupMatches = (await strapi.entityService.findMany(
        "api::group-match.group-match",
        {
          filters: {
            phase: "group_phase",
            matchStatus: { $ne: "cancelled" },
          },
          fields: ["id", "matchStatus", "homeScore", "awayScore"],
          limit: expectedGroupMatchCount + 1,
        },
      )) as MatchRecord[];

      const incompleteGroupMatches = groupMatches.filter(
        (match) =>
          match.matchStatus !== "completed" ||
          match.homeScore === null ||
          match.awayScore === null,
      );

      if (
        groupMatches.length !== expectedGroupMatchCount ||
        incompleteGroupMatches.length > 0
      ) {
        throw new ValidationError(
          `The group phase is incomplete: expected ${expectedGroupMatchCount} completed matches, found ${groupMatches.length - incompleteGroupMatches.length}.`,
        );
      }

      const groups = await computeStandings(
        strapi as unknown as Parameters<typeof computeStandings>[0],
      );

      if (groups.length !== 4) {
        throw new ValidationError(
          `Expected standings for exactly 4 groups, but found ${groups.length}.`,
        );
      }

      const winners = groups
        .map((group) => group.standings[0])
        .sort((a, b) => a.groupName.localeCompare(b.groupName));
      const remainingTeams = groups
        .flatMap((group) => group.standings.slice(1))
        .sort(qualificationSort);
      const cutoff = remainingTeams[ADDITIONAL_QUALIFIER_COUNT - 1];
      const definiteAdditionalQualifiers = remainingTeams.filter(
        (team) =>
          team.points > cutoff.points ||
          (team.points === cutoff.points &&
            team.penaltyPoints < cutoff.penaltyPoints),
      );
      const tiedAtCutoff = remainingTeams.filter((team) =>
        sameQualificationScore(team, cutoff),
      );
      const remainingQualificationSlots =
        ADDITIONAL_QUALIFIER_COUNT - definiteAdditionalQualifiers.length;

      let additionalQualifiers: TeamStanding[];
      let createdMatches = 0;

      if (tiedAtCutoff.length > remainingQualificationSlots) {
        const playoffMatches = (await strapi.entityService.findMany(
          "api::group-match.group-match",
          {
            filters: { phase: "lucky_second_playoff" },
            fields: [
              "id",
              "matchNumber",
              "phase",
              "matchStatus",
              "homeScore",
              "awayScore",
              "team1PenaltyPoints",
              "team2PenaltyPoints",
            ],
            populate: {
              homeTeam: { fields: ["id"] },
              awayTeam: { fields: ["id"] },
            },
            limit: 100,
          },
        )) as MatchRecord[];

        if (playoffMatches.length === 0) {
          const allMatches = (await strapi.entityService.findMany(
            "api::group-match.group-match",
            { fields: ["matchNumber"], limit: 500 },
          )) as MatchRecord[];
          let matchNumber = Math.max(
            0,
            ...allMatches.map((match) => match.matchNumber ?? 0),
          );

          for (const [team1, team2] of pairs(tiedAtCutoff)) {
            matchNumber += 1;
            await strapi.entityService.create("api::group-match.group-match", {
              data: {
                matchNumber,
                phase: "lucky_second_playoff",
                matchStatus: "scheduled",
                homeTeam: team1.teamId,
                awayTeam: team2.teamId,
              },
            });
            createdMatches += 1;
          }

          return {
            status: "playoff_required",
            createdMatches,
            playoffTeams: tiedAtCutoff.map((team) => ({
              teamId: team.teamId,
              teamName: team.teamName,
            })),
          };
        }

        if (
          playoffMatches.some(
            (match) =>
              match.matchStatus !== "completed" ||
              match.homeScore === null ||
              match.awayScore === null,
          )
        ) {
          return {
            status: "playoff_required",
            createdMatches: 0,
            playoffTeams: tiedAtCutoff.map((team) => ({
              teamId: team.teamId,
              teamName: team.teamName,
            })),
          };
        }

        const playoffTable = new Map(
          tiedAtCutoff.map((team) => [
            team.teamId,
            { team, wins: 0, goalDifference: 0, penaltyPoints: 0 },
          ]),
        );

        for (const match of playoffMatches) {
          if (!match.homeTeam || !match.awayTeam) continue;
          if (match.homeScore === match.awayScore) {
            throw new ValidationError("Playoff matches must have a winner.");
          }
          const team1 = playoffTable.get(match.homeTeam.id);
          const team2 = playoffTable.get(match.awayTeam.id);
          if (!team1 || !team2) continue;
          team1.goalDifference += match.homeScore! - match.awayScore!;
          team2.goalDifference += match.awayScore! - match.homeScore!;
          team1.penaltyPoints += match.team1PenaltyPoints ?? 0;
          team2.penaltyPoints += match.team2PenaltyPoints ?? 0;
          if (match.homeScore! > match.awayScore!) team1.wins += 1;
          else team2.wins += 1;
        }

        const playoffWinners = [...playoffTable.values()].sort(
          (a, b) =>
            b.wins - a.wins ||
            a.penaltyPoints - b.penaltyPoints ||
            b.goalDifference - a.goalDifference ||
            a.team.teamName.localeCompare(b.team.teamName),
        );
        additionalQualifiers = [
          ...definiteAdditionalQualifiers,
          ...playoffWinners
            .slice(0, remainingQualificationSlots)
            .map((entry) => entry.team),
        ];
      } else {
        additionalQualifiers = remainingTeams.slice(
          0,
          ADDITIONAL_QUALIFIER_COUNT,
        );
      }

      const quarterfinalPairs = buildQuarterfinalPairs(
        winners,
        additionalQualifiers,
      );
      const existingQuarterfinals = (await strapi.entityService.findMany(
        "api::group-match.group-match",
        {
          filters: { phase: "quarterfinal" },
          fields: ["roundSlot", "matchNumber"],
          limit: 10,
        },
      )) as MatchRecord[];
      const existingSlots = new Set(
        existingQuarterfinals.map((match) => match.roundSlot),
      );
      const allMatches = (await strapi.entityService.findMany(
        "api::group-match.group-match",
        { fields: ["matchNumber"], limit: 500 },
      )) as MatchRecord[];
      let matchNumber = Math.max(
        0,
        ...allMatches.map((match) => match.matchNumber ?? 0),
      );

      for (const [index, [team1, team2]] of quarterfinalPairs.entries()) {
        const roundSlot = index + 1;
        if (existingSlots.has(roundSlot)) continue;
        matchNumber += 1;
        await strapi.entityService.create("api::group-match.group-match", {
          data: {
            matchNumber,
            phase: "quarterfinal",
            roundSlot,
            matchStatus: "scheduled",
            homeTeam: team1.teamId,
            awayTeam: team2.teamId,
          },
        });
        createdMatches += 1;
      }

      return {
        status: "quarterfinals_generated",
        createdMatches,
        qualifiers: [
          ...winners.map((team) => ({
            teamId: team.teamId,
            teamName: team.teamName,
            qualification: "group_winner",
          })),
          ...additionalQualifiers.map((team) => ({
            teamId: team.teamId,
            teamName: team.teamName,
            qualification: "group_stage_ranking",
          })),
        ],
      };
    },
  }),
);
