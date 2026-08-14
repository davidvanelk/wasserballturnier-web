"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Sponsor } from "@/lib/sponsors";

const ROTATION_INTERVAL_MS = 30_000;

function drawSponsor(sponsors: Sponsor[], currentIndex: number) {
  const eligible = sponsors
    .map((sponsor, index) => ({ sponsor, index }))
    .filter(({ index }) => sponsors.length < 2 || index !== currentIndex);
  const totalWeight = eligible.reduce(
    (total, { sponsor }) => total + sponsor.tokenMultiplier,
    0,
  );
  let ticket = Math.random() * totalWeight;
  for (const candidate of eligible) {
    ticket -= candidate.sponsor.tokenMultiplier;
    if (ticket < 0) return candidate.index;
  }
  return eligible.at(-1)?.index ?? 0;
}

export default function SponsorSlot({ sponsors }: { sponsors: Sponsor[] }) {
  const [sponsorIndex, setSponsorIndex] = useState(0);
  const sponsorsRef = useRef(sponsors);
  const visibleIndex = sponsorIndex % Math.max(sponsors.length, 1);
  const sponsor = sponsors[visibleIndex];

  useEffect(() => {
    sponsorsRef.current = sponsors;
  }, [sponsors]);

  useEffect(() => {
    const interval = window.setInterval(
      () =>
        setSponsorIndex((current) => {
          const availableSponsors = sponsorsRef.current;
          if (availableSponsors.length < 2) return 0;
          return drawSponsor(
            availableSponsors,
            current % availableSponsors.length,
          );
        }),
      ROTATION_INTERVAL_MS,
    );
    return () => window.clearInterval(interval);
  }, []);

  if (!sponsor) return null;

  return (
    <aside
      className="grid grid-cols-[auto_auto] grid-rows-[auto_auto] items-center gap-x-3.5 rounded-2xl bg-[#1c1c1c] px-4 py-2.5 text-right text-white/70 shadow-[0_10px_24px_rgba(28,28,28,0.16)]"
      aria-label={`Präsentiert von ${sponsor.sponsor}`}
    >
      <span className="self-end text-[11px] font-extrabold uppercase tracking-[0.12em]">
        Präsentiert von
      </span>
      <Image
        alt={sponsor.alt}
        className="col-start-2 row-span-2 row-start-1 h-[62px] w-auto object-contain"
        height={60}
        priority
        src={`/media${sponsor.logoPath}`}
        unoptimized
        width={220}
      />
      <strong className="self-start text-[15px] text-white">
        {sponsor.sponsor}
      </strong>
    </aside>
  );
}
