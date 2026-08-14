'use client';

import { useEffect, useState } from 'react';
import type { Match, MatchStatus } from '@/lib/matches';

const MATCHES_PER_PAGE = 8;
const PAGE_INTERVAL_MS = 10_000;
const statusLabels: Record<MatchStatus, string> = {
  scheduled: 'Geplant',
  in_progress: 'Läuft',
  completed: 'Abgeschlossen',
  cancelled: 'Abgesagt',
};

export default function KioskTable({ matches }: { matches: Match[] }) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(matches.length / MATCHES_PER_PAGE));
  const visiblePage = page % pageCount;
  const visibleMatches = matches.slice(
    visiblePage * MATCHES_PER_PAGE,
    (visiblePage + 1) * MATCHES_PER_PAGE,
  );
  const date = new Intl.DateTimeFormat('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  });
  const time = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    if (pageCount < 2) return;
    const interval = window.setInterval(
      () => setPage((current) => (current + 1) % pageCount),
      PAGE_INTERVAL_MS,
    );
    return () => window.clearInterval(interval);
  }, [pageCount]);

  if (!matches.length) {
    return <p className="empty">Es sind noch keine Spiele geplant.</p>;
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Zeit</th>
            <th>Begegnung</th>
            <th className="center">Spielstand</th>
            <th className="center">Strafpunkte</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {visibleMatches.map((match) => {
            const playedAt = match.playedAt ? new Date(match.playedAt) : null;
            return (
              <tr
                key={match.id}
                className={
                  match.matchStatus === 'in_progress' ? 'live-row' : undefined
                }
              >
                <td className="date-cell">
                  {playedAt ? (
                    <>
                      <span>{date.format(playedAt)}</span>
                      <strong>{time.format(playedAt)} Uhr</strong>
                    </>
                  ) : (
                    'Noch offen'
                  )}
                </td>
                <th>
                  {match.homeTeam ?? 'Noch offen'}{' '}
                  <span className="separator">–</span>{' '}
                  {match.awayTeam ?? 'Noch offen'}
                </th>
                <td className="score">
                  {match.homeScore ?? '–'} : {match.awayScore ?? '–'}
                </td>
                <td className="center">
                  {match.team1PenaltyPoints} : {match.team2PenaltyPoints}
                </td>
                <td>
                  <span className={`status status-${match.matchStatus}`}>
                    {match.matchStatus === 'in_progress' ? (
                      <span className="spinner" aria-hidden="true" />
                    ) : null}
                    {statusLabels[match.matchStatus]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {pageCount > 1 ? (
        <footer className="pagination" aria-label="Automatischer Seitenwechsel">
          <span>
            Spiele {visiblePage * MATCHES_PER_PAGE + 1}–
            {Math.min((visiblePage + 1) * MATCHES_PER_PAGE, matches.length)} von{' '}
            {matches.length}
          </span>
          <span className="page-dots" aria-label={`Seite ${visiblePage + 1} von ${pageCount}`}>
            {Array.from({ length: pageCount }, (_, index) => (
              <i className={index === visiblePage ? 'active' : undefined} key={index} />
            ))}
          </span>
        </footer>
      ) : null}
    </>
  );
}
