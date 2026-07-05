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
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-mono text-2xl uppercase text-[var(--brand-ink)]">
              Angaben gemäß § 5 TMG
            </h2>
            <div className="mt-4 space-y-2 text-base leading-7 text-[var(--brand-gray)]">
              <p>Freiwillige Feuerwehr Emmerich am Rhein</p>
              <p>Löscheinheit Elten</p>
              <p>Haagsche Straße 2</p>
              <p>46446 Emmerich am Rhein</p>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-2xl uppercase text-[var(--brand-ink)]">
              Kontakt
            </h2>
            <div className="mt-4 space-y-2 text-base leading-7 text-[var(--brand-gray)]">
              <p>E-Mail: loescheinheit-elten@feuerwehr-emmerich.de</p>
              <p>Instagram: @feuerwehremmerich</p>
              <p>Facebook: Feuerwehr Emmerich am Rhein</p>
            </div>
          </div>
        </div>
      </FlyerSurface>
    </main>
  );
}
