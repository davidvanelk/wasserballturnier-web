export type MatchStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type Match = {
  id: number;
  matchNumber: number;
  matchStatus: MatchStatus;
  playedAt: string | null;
  homeScore: number | null;
  awayScore: number | null;
  team1PenaltyPoints: number;
  team2PenaltyPoints: number;
  homeTeam: string | null;
  awayTeam: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function teamName(value: unknown): string | null {
  return isRecord(value) && typeof value.name === 'string' ? value.name : null;
}

function matchStatus(value: unknown): MatchStatus {
  return value === 'in_progress' || value === 'completed' || value === 'cancelled'
    ? value
    : 'scheduled';
}

function parseMatch(value: unknown): Match | null {
  if (!isRecord(value) || typeof value.id !== 'number') return null;

  return {
    id: value.id,
    matchNumber: nullableNumber(value.matchNumber) ?? value.id,
    matchStatus: matchStatus(value.matchStatus),
    playedAt: typeof value.playedAt === 'string' ? value.playedAt : null,
    homeScore: nullableNumber(value.homeScore),
    awayScore: nullableNumber(value.awayScore),
    team1PenaltyPoints: nullableNumber(value.team1PenaltyPoints) ?? 0,
    team2PenaltyPoints: nullableNumber(value.team2PenaltyPoints) ?? 0,
    homeTeam: teamName(value.homeTeam),
    awayTeam: teamName(value.awayTeam),
  };
}

export async function getMatches(): Promise<Match[]> {
  const strapiUrl = process.env.STRAPI_URL?.replace(/\/$/, '');
  if (!strapiUrl) throw new Error('STRAPI_URL ist nicht konfiguriert.');

  const query = new URLSearchParams({
    'populate[homeTeam]': 'true',
    'populate[awayTeam]': 'true',
    'pagination[limit]': '200',
    'sort[0]': 'playedAt:asc',
    'sort[1]': 'matchNumber:asc',
  });
  let response: Response;
  try {
    response = await fetch(`${strapiUrl}/api/group-matches?${query}`, {
      cache: 'no-store',
    });
  } catch (error) {
    throw new Error(`Strapi ist unter ${strapiUrl} nicht erreichbar.`, {
      cause: error,
    });
  }
  if (!response.ok) throw new Error(`Strapi antwortet mit Status ${response.status}.`);

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error('Strapi hat ein unerwartetes Datenformat geliefert.');
  }

  return payload.data
    .map(parseMatch)
    .filter((match): match is Match => match !== null)
    .sort((first, second) => {
      if (!first.playedAt) return second.playedAt ? 1 : first.matchNumber - second.matchNumber;
      if (!second.playedAt) return -1;
      return new Date(first.playedAt).getTime() - new Date(second.playedAt).getTime()
        || first.matchNumber - second.matchNumber;
    });
}
