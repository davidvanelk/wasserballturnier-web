import AutoRefresh from "./AutoRefresh";
import KioskTable from "./KioskTable";
import SponsorSlot from "./SponsorSlot";
import { createBerlinDateTimeFormatter } from "@/lib/date-time";
import { getMatches, type Match } from "@/lib/matches";
import { getSponsors } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export default async function KioskPage() {
  let matches: Match[] = [];
  let loadFailed = false;
  const sponsorsPromise = getSponsors();
  try {
    matches = await getMatches();
  } catch (error) {
    loadFailed = true;
    console.error("[kiosk] Spiele konnten nicht geladen werden:", error);
  }
  const sponsors = await sponsorsPromise;
  const time = createBerlinDateTimeFormatter("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const updatedAt = time.format(new Date());

  return (
    <main className="h-screen overflow-hidden p-[clamp(20px,2vw,32px)]">
      <AutoRefresh />
      <header className="mb-5 flex items-end justify-between gap-8 max-[900px]:flex-col max-[900px]:items-start">
        <div>
          <p className="mb-2 text-[clamp(14px,1.2vw,20px)] font-extrabold uppercase tracking-[0.18em] text-[#d6221f]">
            Wasserballturnier 2026
          </p>
          <h1 className="m-0 text-[clamp(42px,4vw,72px)] font-bold uppercase leading-[0.95]">
            Spielübersicht
          </h1>
        </div>
        <div className="fixed right-8 top-8 z-20 flex flex-col items-end gap-2 max-[1100px]:right-5 max-[1100px]:top-5">
          <SponsorSlot sponsors={sponsors} />
          <p className="m-0 text-right text-[clamp(14px,1.2vw,20px)] text-[#5f6368]">
            Aktualisiert: {updatedAt} Uhr · automatisch alle 30 Sekunden
          </p>
        </div>
      </header>

      <section
        className="overflow-hidden rounded-[28px] border border-black/8 bg-white shadow-[0_18px_40px_rgba(28,28,28,0.08)]"
        aria-label="Spielübersicht"
      >
        {loadFailed ? (
          <div
            className="flex min-h-[360px] items-center justify-center gap-6 p-12 text-left text-sky-800"
            role="alert"
          >
            <span
              className="h-[42px] w-[42px] shrink-0 animate-spin rounded-full border-[5px] border-sky-200 border-t-sky-700 motion-reduce:animate-none"
              aria-hidden="true"
            />
            <div>
              <strong className="block text-[clamp(26px,2vw,38px)]">
                Keine Verbindung zum Spielplan
              </strong>
              <p className="mt-2.5 max-w-[720px] text-[clamp(17px,1.2vw,23px)] leading-[1.45] text-[#52606b]">
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
