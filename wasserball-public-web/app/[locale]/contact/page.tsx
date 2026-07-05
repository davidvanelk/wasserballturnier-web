import FlyerButtonLink from '@/lib/components/FlyerButtonLink';
import FlyerSurface from '@/lib/components/FlyerSurface';
import PageHero from '@/lib/components/PageHero';

export default function ContactPage() {
  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero
        eyebrow="Kontakt"
        title="Fragen zum Turnier?"
        description="Für Rückfragen zur Organisation, Anmeldung oder zum Veranstaltungstag erreichst du die Löscheinheit Elten direkt."
      >
        <div className="flex flex-wrap gap-3">
          <FlyerButtonLink href="mailto:loescheinheit-elten@feuerwehr-emmerich.de">
            E-Mail schreiben
          </FlyerButtonLink>
          <FlyerButtonLink
            href="https://www.instagram.com/feuerwehremmerich/"
            variant="secondary"
            external
          >
            Instagram
          </FlyerButtonLink>
        </div>
      </PageHero>

      <FlyerSurface className="p-6 sm:p-8" revealDelay={1}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[rgba(28,28,28,0.08)] bg-white p-6 shadow-[0_12px_28px_rgba(28,28,28,0.06)]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
              Ansprechpartner
            </p>
            <h2 className="mt-3 font-mono text-3xl uppercase text-[var(--brand-ink)]">
              Löscheinheit Elten
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--brand-gray)]">
              Freiwillige Feuerwehr Emmerich am Rhein
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[rgba(28,28,28,0.08)] bg-white p-6 shadow-[0_12px_28px_rgba(28,28,28,0.06)]">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--brand-red)]">
              Kontaktwege
            </p>
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
