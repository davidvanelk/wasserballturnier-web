import { errors } from "@strapi/utils";

const { ValidationError } = errors;

type MatchForLabel = {
  id: number;
  matchLabel?: string | null;
  phase?: string | null;
  roundSlot?: number | null;
  group?: { name?: string | null } | null;
  homeTeam?: { name?: string | null } | null;
  awayTeam?: { name?: string | null } | null;
};

type MatchUpdateData = {
  phase?: string;
  matchStatus?: string;
  homeScore?: number | null;
  awayScore?: number | null;
};

type MatchUpdateEvent = {
  params?: {
    where?: { id?: number };
    data?: MatchUpdateData;
  };
  result?: { id?: number };
};

function phaseLabel(match: MatchForLabel) {
  if (match.group?.name) return match.group.name;
  if (match.phase === "quarterfinal") {
    return match.roundSlot
      ? `Viertelfinale ${match.roundSlot}`
      : "Viertelfinale";
  }
  if (match.phase === "lucky_second_playoff") return "Stechspiel";
  if (match.phase === "semifinal") {
    return match.roundSlot ? `Halbfinale ${match.roundSlot}` : "Halbfinale";
  }
  if (match.phase === "third_place") return "Spiel um Platz 3";
  if (match.phase === "final") return "Finale";
  return "Spiel";
}

export function createMatchLabel(match: MatchForLabel) {
  if (!match.homeTeam?.name || !match.awayTeam?.name) return null;
  return `[${phaseLabel(match)}] ${match.homeTeam.name} - ${match.awayTeam.name}`;
}

async function updateMatchLabel(id?: number) {
  if (!id) return;

  const match = (await strapi.entityService.findOne(
    "api::group-match.group-match",
    id,
    {
      fields: ["id", "matchLabel", "phase", "roundSlot"],
      populate: {
        group: { fields: ["name"] },
        homeTeam: { fields: ["name"] },
        awayTeam: { fields: ["name"] },
      },
    },
  )) as MatchForLabel | null;

  if (!match) return;
  const matchLabel = createMatchLabel(match);
  if (!matchLabel || match.matchLabel === matchLabel) return;

  await strapi.db.query("api::group-match.group-match").update({
    where: { id },
    data: { matchLabel },
  });
}

export default {
  async beforeUpdate(event: MatchUpdateEvent) {
    const id = event.params?.where?.id;
    const data = event.params?.data;
    if (!id || !data) return;

    const current = (await strapi.entityService.findOne(
      "api::group-match.group-match",
      id,
      { fields: ["phase", "matchStatus", "homeScore", "awayScore"] },
    )) as MatchUpdateData | null;
    if (!current) return;

    const phase = data.phase ?? current.phase;
    const matchStatus = data.matchStatus ?? current.matchStatus;
    const homeScore = data.homeScore ?? current.homeScore;
    const awayScore = data.awayScore ?? current.awayScore;
    if (
      ["quarterfinal", "semifinal", "third_place", "final"].includes(
        phase ?? "",
      ) &&
      matchStatus === "completed" &&
      homeScore !== null &&
      awayScore !== null &&
      homeScore === awayScore
    ) {
      throw new ValidationError("Knockout matches must have a winner.");
    }
  },
  async afterCreate(event: { result?: { id?: number } }) {
    await updateMatchLabel(event.result?.id);
  },
  async afterUpdate(event: MatchUpdateEvent) {
    await updateMatchLabel(event.result?.id);
    if (event.result?.id) {
      const service = strapi.service("api::knockout.knockout") as {
        advanceKnockoutBracket: (matchId: number) => Promise<void>;
      };
      await service.advanceKnockoutBracket(event.result.id);
    }
  },
};
