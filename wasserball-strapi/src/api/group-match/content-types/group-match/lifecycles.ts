type MatchForLabel = {
  id: number;
  matchLabel?: string | null;
  phase?: string | null;
  roundSlot?: number | null;
  group?: { name?: string | null } | null;
  homeTeam?: { name?: string | null } | null;
  awayTeam?: { name?: string | null } | null;
};

function phaseLabel(match: MatchForLabel) {
  if (match.group?.name) return match.group.name;
  if (match.phase === "quarterfinal") {
    return match.roundSlot
      ? `Viertelfinale ${match.roundSlot}`
      : "Viertelfinale";
  }
  if (match.phase === "lucky_second_playoff") return "Stechspiel";
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
  async afterCreate(event: { result?: { id?: number } }) {
    await updateMatchLabel(event.result?.id);
  },
  async afterUpdate(event: { result?: { id?: number } }) {
    await updateMatchLabel(event.result?.id);
  },
};
