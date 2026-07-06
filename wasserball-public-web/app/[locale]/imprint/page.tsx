import FlyerSurface from '@/lib/components/FlyerSurface';
import PageHero from '@/lib/components/PageHero';

export default async function Imprint() {
  return (
    <main className="flex w-full flex-col gap-8 lg:gap-10">
      <PageHero eyebrow="Rechtliches" title="Impressum" />

      <FlyerSurface className="p-6 sm:p-8" revealDelay={1}>
        <p className="font-bold text-xl-3">Angaben gemäß § 5 TMG</p>
        <p className="font-bold">Herausgeber:</p>
        Freiwillige Feuerwehr Emmerich am Rhein
        <br />
        Vertreten durch den Leiter der Feuerwehr
        <br />
        Christian Knorr
        <br />
        Pastor-Breuer Straße 51
        <br />
        46446 Emmerich am Rhein
        <br />
        <p className="mt-3">
          Träger der Feuerwehr: Stadt Emmerich am Rhein <br />
          Die Bürgermeisterin
        </p>
        Geistmarkt 1 <br />
        46446 Emmerich am Rhein
        <p className="mt-6 font-bold">Kontakt:</p>
        Telefon: +49 2822 0 75-16 61 <br />
        E-Mail:
        <a className="ml-1" href="mailto:christian.knorr@stadt-emmerich.de">
          christian.knorr@stadt-emmerich.de
        </a>
        <p className="mt-6 font-bold">
          Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
        </p>
        <p>David van Elk</p>
        <p>Pastor-Breuer Straße 51</p>
        <p>46446 Emmerich am Rhein</p>
      </FlyerSurface>
    </main>
  );
}
