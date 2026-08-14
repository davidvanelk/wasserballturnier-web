import Link from 'next/link';
import type { StrapiMatch } from '@/lib/strapi/tournament';
import { cn } from './utils';

type MatchTableProps = {
  className?: string;
  locale: string;
  matches: StrapiMatch[];
  labels: {
    time: string;
    match: string;
    score: string;
    penaltyPoints: string;
    status: string;
    notSet: string;
    empty: string;
    statuses: Record<StrapiMatch['matchStatus'], string>;
  };
};

export default function MatchTable({
  className = '',
  locale,
  matches,
  labels,
}: MatchTableProps) {
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  const timeFormatter = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={cn('overflow-hidden', className)}>
      {matches.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-[var(--brand-ink)] text-white">
              <tr>
                <th className="px-5 py-4 text-left" scope="col">
                  {labels.time}
                </th>
                <th className="px-4 py-4 text-left" scope="col">
                  {labels.match}
                </th>
                <th className="px-4 py-4 text-center" scope="col">
                  {labels.score}
                </th>
                <th className="px-4 py-4 text-center" scope="col">
                  {labels.penaltyPoints}
                </th>
                <th className="px-5 py-4 text-left" scope="col">
                  {labels.status}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-line)]">
              {matches.map((match) => {
                const playedAt = match.playedAt
                  ? new Date(match.playedAt)
                  : null;
                const homeTeam = match.homeTeam?.name ?? labels.notSet;
                const awayTeam = match.awayTeam?.name ?? labels.notSet;

                return (
                  <tr className="bg-white/55 hover:bg-white" key={match.id}>
                    <td className="whitespace-nowrap px-5 py-4">
                      {playedAt ? (
                        <>
                          <span className="text-[var(--brand-gray)]">
                            {dateFormatter.format(playedAt)}
                          </span>
                          <br />
                          <span className="font-mono text-lg font-bold text-[var(--brand-ink)]">
                            {timeFormatter.format(playedAt)}
                          </span>
                        </>
                      ) : (
                        labels.notSet
                      )}
                    </td>
                    <th className="px-4 py-4 text-left" scope="row">
                      <Link
                        className="font-semibold text-[var(--brand-ink)] hover:text-[var(--brand-red)]"
                        href={`/${locale}/matches/${match.id}`}
                      >
                        {homeTeam}{' '}
                        <span className="font-normal text-[var(--brand-gray)]">
                          –
                        </span>{' '}
                        {awayTeam}
                      </Link>
                    </th>
                    <td className="px-4 py-4 text-center font-mono text-xl font-bold">
                      {match.homeScore ?? '–'} : {match.awayScore ?? '–'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {match.team1PenaltyPoints ?? 0} :{' '}
                      {match.team2PenaltyPoints ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em]',
                          match.matchStatus === 'in_progress'
                            ? 'items-center gap-2 bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200'
                            : match.matchStatus === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200'
                              : 'bg-[var(--surface-muted)] text-[var(--brand-gray)]',
                        )}
                      >
                        {match.matchStatus === 'in_progress' ? (
                          <span
                            aria-hidden="true"
                            className="h-3 w-3 animate-spin rounded-full border-2 border-sky-300 border-t-sky-700 motion-reduce:animate-none"
                          />
                        ) : null}
                        {labels.statuses[match.matchStatus]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="p-8 text-center text-[var(--brand-gray)]">
          {labels.empty}
        </p>
      )}
    </div>
  );
}
