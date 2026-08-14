import AutoRefresh from './AutoRefresh';
import KioskTable from './KioskTable';
import SponsorSlot from './SponsorSlot';
import { getMatches, type Match } from '@/lib/matches';
import { getSponsors } from '@/lib/sponsors';

export const dynamic = 'force-dynamic';

export default async function KioskPage() {
  let matches: Match[] = [];
  let loadFailed = false;
  const sponsorsPromise = getSponsors();
  try {
    matches = await getMatches();
  } catch (error) {
    loadFailed = true;
    console.error('[kiosk] Spiele konnten nicht geladen werden:', error);
  }
  const sponsors = await sponsorsPromise;
  const time = new Intl.DateTimeFormat('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const updatedAt = time.format(new Date());

  return (
    <main>
      <AutoRefresh />
      <header>
        <div>
          <p className="eyebrow">Wasserballturnier 2026</p>
          <h1>Spielübersicht</h1>
        </div>
        <div className="header-side">
          <SponsorSlot sponsors={sponsors} />
          <p className="updated">Aktualisiert: {updatedAt} Uhr · automatisch alle 30 Sekunden</p>
        </div>
      </header>

      <section className="table-frame" aria-label="Spielübersicht">
        {loadFailed ? (
          <div className="connection-error" role="alert">
            <span className="retry-spinner" aria-hidden="true" />
            <div>
              <strong>Keine Verbindung zum Spielplan</strong>
              <p>
                Das CMS ist momentan nicht erreichbar. Der nächste Versuch
                erfolgt automatisch in spätestens 30 Sekunden.
              </p>
            </div>
          </div>
        ) : (
          <KioskTable matches={matches} />
        )}
      </section>
    </main>
  );
}
