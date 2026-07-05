import FlyerSurface from '@/lib/components/FlyerSurface';
import PageHero from '@/lib/components/PageHero';

export default function PrivacyPage() {
  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero
        eyebrow="Rechtliches"
        title="Datenschutz"
        description="Diese Seite hält den Datenschutz-Verweis aus dem Footer funktionsfähig und folgt derselben Oberflächenstruktur wie der Rest der App."
      />

      <FlyerSurface className="p-6 sm:p-8" revealDelay={1}>
        <div className="max-w-4xl space-y-5 text-base leading-7 text-[var(--brand-gray)]">
          <p>
            Personenbezogene Daten werden nur im technisch notwendigen Umfang
            verarbeitet. Welche Daten im Detail anfallen, hängt von der Nutzung
            dieser Website und der eingebundenen Dienste ab.
          </p>
          <p>
            Bei Fragen zum Datenschutz oder zur Auskunft über gespeicherte Daten
            wende dich bitte an die Löscheinheit Elten unter
            loescheinheit-elten@feuerwehr-emmerich.de.
          </p>
          <p>
            Diese Platzhalterseite stellt die rechtliche Route bereit. Die
            endgültigen Datenschutzhinweise sollten vor dem Live-Betrieb mit den
            tatsächlichen Verarbeitungsprozessen abgeglichen werden.
          </p>
        </div>
      </FlyerSurface>
    </main>
  );
}
