'use client';

import { useEffect, useRef, useState } from 'react';
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
  const timerIndicatorRef = useRef<HTMLSpanElement>(null);
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

  useEffect(() => {
    const indicator = timerIndicatorRef.current;
    if (!indicator || pageCount < 2) return;

    const animation = indicator.animate(
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      {
        duration: PAGE_INTERVAL_MS,
        easing: 'linear',
        fill: 'forwards',
      },
    );
    return () => animation.cancel();
  }, [pageCount, visiblePage]);

  if (!matches.length) {
    return (
      <p className="p-16 text-center text-2xl text-[#697077]">
        Es sind noch keine Spiele geplant.
      </p>
    );
  }

  return (
    <>
      {pageCount > 1 ? (
        <div
          className="fixed inset-x-0 top-0 z-50 h-2 bg-black/10"
          aria-hidden="true"
        >
          <span
            className="block h-full origin-left bg-[#d6221f] shadow-[0_0_10px_rgba(214,34,31,0.55)]"
            ref={timerIndicatorRef}
          />
        </div>
      ) : null}
      <table className="w-full border-collapse text-[clamp(16px,1.25vw,24px)] max-[900px]:min-w-[850px]">
        <thead className="bg-[#1c1c1c] text-white">
          <tr className="[&>th]:p-[clamp(14px,1.15vw,22px)] [&>th]:text-left">
            <th>Zeit</th>
            <th>Begegnung</th>
            <th className="!text-center">Spielstand</th>
            <th className="!text-center">Strafpunkte</th>
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
                  match.matchStatus === 'in_progress'
                    ? 'border-t border-[#e5e7eb] bg-sky-50 even:bg-sky-50'
                    : 'border-t border-[#e5e7eb] even:bg-[#fafafa]'
                }
              >
                <td className="whitespace-nowrap p-[clamp(14px,1.15vw,22px)] text-left">
                  {playedAt ? (
                    <>
                      <span className="block text-[0.72em] uppercase text-[#697077]">
                        {date.format(playedAt)}
                      </span>
                      <strong className="mt-[3px] block">
                        {time.format(playedAt)} Uhr
                      </strong>
                    </>
                  ) : (
                    'Noch offen'
                  )}
                </td>
                <th className="p-[clamp(14px,1.15vw,22px)] text-left">
                  {match.homeTeam ?? 'Noch offen'}{' '}
                  <span className="font-normal text-[#8b8f94]">–</span>{' '}
                  {match.awayTeam ?? 'Noch offen'}
                </th>
                <td className="whitespace-nowrap p-[clamp(14px,1.15vw,22px)] text-center text-[1.3em] font-extrabold">
                  {match.homeScore ?? '–'} : {match.awayScore ?? '–'}
                </td>
                <td className="p-[clamp(14px,1.15vw,22px)] text-center">
                  {match.team1PenaltyPoints} : {match.team2PenaltyPoints}
                </td>
                <td className="p-[clamp(14px,1.15vw,22px)] text-left">
                  <span
                    className={`inline-flex items-center gap-[9px] whitespace-nowrap rounded-full px-[13px] py-2 text-[0.62em] font-extrabold uppercase tracking-[0.06em] ${
                      match.matchStatus === 'in_progress'
                        ? 'border border-sky-200 bg-sky-100 text-sky-800'
                        : match.matchStatus === 'completed'
                          ? 'border border-emerald-200 bg-emerald-100 text-emerald-800'
                          : 'bg-[#f1f3f4] text-[#62666b]'
                    }`}
                  >
                    {match.matchStatus === 'in_progress' ? (
                      <span
                        className="h-[13px] w-[13px] animate-spin rounded-full border-2 border-sky-300 border-t-sky-700 motion-reduce:animate-none"
                        aria-hidden="true"
                      />
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
        <footer
          className="flex min-h-12 items-center justify-between border-t border-[#e5e7eb] bg-[#fafafa] px-[clamp(16px,1.5vw,28px)] py-2.5 text-[clamp(13px,0.9vw,17px)] text-[#697077]"
          aria-label="Automatischer Seitenwechsel"
        >
          <span>
            Spiele {visiblePage * MATCHES_PER_PAGE + 1}–
            {Math.min((visiblePage + 1) * MATCHES_PER_PAGE, matches.length)} von{' '}
            {matches.length}
          </span>
          <span
            className="flex gap-2"
            aria-label={`Seite ${visiblePage + 1} von ${pageCount}`}
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <i
                className={
                  index === visiblePage
                    ? 'h-[9px] w-[26px] rounded-full bg-[#d6221f]'
                    : 'h-[9px] w-[9px] rounded-full bg-[#c9cdd1]'
                }
                key={index}
              />
            ))}
          </span>
        </footer>
      ) : null}
    </>
  );
}
