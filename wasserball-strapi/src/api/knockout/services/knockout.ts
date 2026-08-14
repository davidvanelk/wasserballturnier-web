import { factories } from "@strapi/strapi";
import { errors } from "@strapi/utils";

const { ValidationError } = errors;

type TeamRecord = {
  id: number;
  name: string;
  knockoutSlot: number | null;
};

type KnockoutPhase = "quarterfinal" | "semifinal" | "third_place" | "final";
type MatchStatus = "scheduled" | "in_progress" | "completed" | "cancelled";
type TeamSide = "homeTeam" | "awayTeam";

type MatchRecord = {
  id: number;
  matchNumber: number;
  phase: KnockoutPhase;
  roundSlot: number | null;
  matchStatus: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  homeTeam: { id: number } | null;
  awayTeam: { id: number } | null;
};

type BracketMatch = {
  phase: KnockoutPhase;
  roundSlot: number;
  homeTeam?: number;
  awayTeam?: number;
};

type GroupMatchMutationData = {
  matchNumber?: number;
  phase?: KnockoutPhase;
  roundSlot?: number;
  matchStatus?: MatchStatus;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam?: number;
  awayTeam?: number;
};

type GroupMatchWriter = {
  create: (
    uid: "api::group-match.group-match",
    params: { data: GroupMatchMutationData },
  ) => Promise<unknown>;
  update: (
    uid: "api::group-match.group-match",
    id: number,
    params: { data: GroupMatchMutationData },
  ) => Promise<unknown>;
};

type ParticipantAssignment = {
  phase: Exclude<KnockoutPhase, "quarterfinal">;
  roundSlot: number;
  side: TeamSide;
  teamId: number;
};

type GenerationResult = {
  status: "knockout_bracket_generated";
  createdMatches: number;
  slots: Array<{ slot: number; teamId: number; teamName: string }>;
};

const bracketDefinition = (
  teamsBySlot: Map<number, TeamRecord>,
): BracketMatch[] => {
  const teamIdAt = (slot: number): number => {
    const team = teamsBySlot.get(slot);
    if (!team) {
      throw new ValidationError(`Knockout slot ${slot} is not assigned.`);
    }
    return team.id;
  };

  return [
    ...[1, 2, 3, 4].map((roundSlot) => ({
      phase: "quarterfinal" as const,
      roundSlot,
      homeTeam: teamIdAt(roundSlot * 2 - 1),
      awayTeam: teamIdAt(roundSlot * 2),
    })),
    { phase: "semifinal", roundSlot: 1 },
    { phase: "semifinal", roundSlot: 2 },
    { phase: "third_place", roundSlot: 1 },
    { phase: "final", roundSlot: 1 },
  ];
};

export default factories.createCoreService(
  "api::group-match.group-match",
  ({ strapi }) => {
    // Strapi's generated Entity Service input omits relation mutations. Keep
    // that framework limitation isolated behind an exact local mutation DTO.
    const groupMatchWriter =
      strapi.entityService as unknown as GroupMatchWriter;

    return {
      async generateKnockoutRound(): Promise<GenerationResult> {
        const assignedTeams = (await strapi.entityService.findMany(
          "api::team.team",
          {
            filters: { knockoutSlot: { $notNull: true } },
            fields: ["id", "name", "knockoutSlot"],
            limit: 100,
          },
        )) as unknown as TeamRecord[];
        const teamsBySlot = new Map<number, TeamRecord>();
        for (const team of assignedTeams) {
          if (team.knockoutSlot !== null) {
            teamsBySlot.set(team.knockoutSlot, team);
          }
        }
        const missingSlots = Array.from(
          { length: 8 },
          (_, index) => index + 1,
        ).filter((slot) => !teamsBySlot.has(slot));

        if (assignedTeams.length !== 8 || missingSlots.length > 0) {
          throw new ValidationError(
            `All knockout slots 1 through 8 must be assigned exactly once. Missing slots: ${missingSlots.join(", ") || "none"}.`,
          );
        }

        const existingMatches = (await strapi.entityService.findMany(
          "api::group-match.group-match",
          {
            filters: {
              phase: {
                $in: ["quarterfinal", "semifinal", "third_place", "final"],
              },
            },
            fields: [
              "id",
              "matchNumber",
              "phase",
              "roundSlot",
              "matchStatus",
              "homeScore",
              "awayScore",
            ],
            populate: {
              homeTeam: { fields: ["id"] },
              awayTeam: { fields: ["id"] },
            },
            limit: 100,
          },
        )) as unknown as MatchRecord[];
        const allMatches = (await strapi.entityService.findMany(
          "api::group-match.group-match",
          { fields: ["matchNumber"], limit: 500 },
        )) as unknown as MatchRecord[];
        let matchNumber = Math.max(
          0,
          ...allMatches.map((match) => match.matchNumber ?? 0),
        );
        let createdMatches = 0;

        for (const definition of bracketDefinition(teamsBySlot)) {
          const existing = existingMatches.find(
            (match) =>
              match.phase === definition.phase &&
              match.roundSlot === definition.roundSlot,
          );
          if (existing) {
            if (
              definition.phase === "quarterfinal" &&
              (existing.homeTeam?.id !== definition.homeTeam ||
                existing.awayTeam?.id !== definition.awayTeam)
            ) {
              if (existing.matchStatus === "completed") {
                throw new ValidationError(
                  `Quarterfinal ${definition.roundSlot} is already completed and cannot be reassigned.`,
                );
              }
              await groupMatchWriter.update(
                "api::group-match.group-match",
                existing.id,
                {
                  data: {
                    homeTeam: definition.homeTeam,
                    awayTeam: definition.awayTeam,
                    homeScore: null,
                    awayScore: null,
                  },
                },
              );
            }
            continue;
          }

          matchNumber += 1;
          await groupMatchWriter.create("api::group-match.group-match", {
            data: {
              matchNumber,
              phase: definition.phase,
              roundSlot: definition.roundSlot,
              matchStatus: "scheduled",
              ...(definition.homeTeam ? { homeTeam: definition.homeTeam } : {}),
              ...(definition.awayTeam ? { awayTeam: definition.awayTeam } : {}),
            },
          });
          createdMatches += 1;
        }

        // This also repairs assignments when results existed before missing later
        // bracket matches were generated.
        for (const match of existingMatches) {
          if (match.matchStatus === "completed") {
            await this.advanceKnockoutBracket(match.id);
          }
        }

        return {
          status: "knockout_bracket_generated",
          createdMatches,
          slots: [...teamsBySlot.entries()]
            .sort(([a], [b]) => a - b)
            .map(([slot, team]) => ({
              slot,
              teamId: team.id,
              teamName: team.name,
            })),
        };
      },

      async advanceKnockoutBracket(matchId: number): Promise<void> {
        const match = (await strapi.entityService.findOne(
          "api::group-match.group-match",
          matchId,
          {
            fields: [
              "id",
              "phase",
              "roundSlot",
              "matchStatus",
              "homeScore",
              "awayScore",
            ],
            populate: {
              homeTeam: { fields: ["id"] },
              awayTeam: { fields: ["id"] },
            },
          },
        )) as unknown as MatchRecord | null;

        if (
          !match ||
          match.matchStatus !== "completed" ||
          !(match.phase === "quarterfinal" || match.phase === "semifinal") ||
          match.roundSlot === null ||
          match.homeScore === null ||
          match.awayScore === null ||
          !match.homeTeam ||
          !match.awayTeam
        )
          return;
        if (match.homeScore === match.awayScore) {
          throw new ValidationError("Knockout matches must have a winner.");
        }

        const winner =
          match.homeScore > match.awayScore
            ? match.homeTeam.id
            : match.awayTeam.id;
        const loser =
          match.homeScore > match.awayScore
            ? match.awayTeam.id
            : match.homeTeam.id;
        const side = match.roundSlot === 1 ? "homeTeam" : "awayTeam";
        const assignments: ParticipantAssignment[] =
          match.phase === "quarterfinal"
            ? [
                {
                  phase: "semifinal",
                  roundSlot: Math.ceil(match.roundSlot / 2),
                  side: match.roundSlot % 2 === 1 ? "homeTeam" : "awayTeam",
                  teamId: winner,
                },
              ]
            : [
                { phase: "final", roundSlot: 1, side, teamId: winner },
                { phase: "third_place", roundSlot: 1, side, teamId: loser },
              ];

        for (const assignment of assignments) {
          const targets = (await strapi.entityService.findMany(
            "api::group-match.group-match",
            {
              filters: {
                phase: assignment.phase,
                roundSlot: assignment.roundSlot,
              },
              fields: ["id", "matchStatus"],
              limit: 2,
            },
          )) as unknown as MatchRecord[];
          const target = targets[0];
          if (!target) continue;
          if (target.matchStatus === "completed") {
            throw new ValidationError(
              `Cannot change the participant of completed ${assignment.phase} match ${assignment.roundSlot}.`,
            );
          }
          const participantUpdate: Pick<GroupMatchMutationData, TeamSide> = {};
          participantUpdate[assignment.side] = assignment.teamId;
          await groupMatchWriter.update(
            "api::group-match.group-match",
            target.id,
            {
              data: participantUpdate,
            },
          );
        }
      },
    };
  },
);
