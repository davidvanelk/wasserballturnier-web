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
      className="advertisement"
      aria-label={`Präsentiert von ${sponsor.sponsor}`}
    >
      <span>Präsentiert von</span>
      <Image
        alt={sponsor.alt}
        height={60}
        priority
        src={`/media${sponsor.logoPath}`}
        unoptimized
        width={220}
      />
      <strong>{sponsor.sponsor}</strong>
    </aside>
  );
}
