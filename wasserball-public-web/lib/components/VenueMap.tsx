'use client';

import dynamic from 'next/dynamic';

const LeafletVenueMap = dynamic(() => import('./LeafletVenueMap'), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse bg-[var(--surface-muted)]" />,
});

export default function VenueMap({ title }: { title: string }) {
  return (
    <div
      className="mt-6 h-80 w-full overflow-hidden rounded-[1.5rem] border border-[rgba(28,28,28,0.08)]"
      aria-label={title}
    >
      <LeafletVenueMap />
    </div>
  );
}
