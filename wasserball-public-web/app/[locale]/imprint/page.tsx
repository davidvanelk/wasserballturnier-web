import FlyerSurface from '@/lib/components/FlyerSurface';
import PageHero from '@/lib/components/PageHero';

export default async function Imprint() {
  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero
        eyebrow="Rechtliches"
        title="Impressum"
        description="Die rechtlichen Angaben sind in dieselbe visuelle Struktur eingebettet wie die Veranstaltungsseiten."
      />

      <FlyerSurface className="p-6 sm:p-8" revealDelay={1}>
        <div className="grid gap-8 lg:grid-cols-2"></div>
      </FlyerSurface>
    </main>
  );
}
