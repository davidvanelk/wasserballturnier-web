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
        <div className="max-w-4xl space-y-5 text-base leading-7 text-[var(--brand-gray)]"></div>
      </FlyerSurface>
    </main>
  );
}
