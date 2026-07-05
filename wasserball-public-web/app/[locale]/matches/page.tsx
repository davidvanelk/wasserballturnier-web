import MatchTable from '@/lib/components/MatchTable';
import PageHero from '@/lib/components/PageHero';
import PriceList from '@/lib/components/PriceList';

export default function MatchesPage() {
  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero
        eyebrow="Turniertag"
        title="Hier spielt die Musik"
        description="Spielplan und Verpflegung bleiben in derselben Flyer-Struktur gebündelt, damit Besucher den Tag schnell erfassen können."
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.9fr)]">
        <MatchTable />
        <PriceList />
      </div>
    </main>
  );
}
