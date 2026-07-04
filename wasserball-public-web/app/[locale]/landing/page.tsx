import { getScopedI18n } from '@/app/i18n/server';
import SponsorCarousel from '@/lib/components/SponsorCarousel';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const t = await getScopedI18n('landing');
  const googleMapsApiKey = process.env.GOOGLE_MAPS_EMBED_API_KEY ?? '';
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=51.877462,6.150263';
  const calendarUrl = '/api/calendar';
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=51.877462%2C6.150263`;

  return (
    <main className="relative overflow-hidden grid grid-cols-1 gap-16 py-20">
      <section className="md:text-center">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-700 font-semibold">
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 text-4xl sm:text-6xl font-black leading-tight text-slate-900">
          {t('title')}
          <br />
          {t('title_2')}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-700">
          {t('subtitle')}
        </p>
        <p className="mt-4 text-lg sm:text-xl text-slate-700">
          {t('subtitle_2')}
        </p>
        <p className="mt-4 text-lg sm:text-xl text-slate-700">
          {t('subtitle_3')}
        </p>
      </section>

      <section>
        <div className="rounded-2xl border border-cyan-100 bg-white/85 p-5 sm:p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            {t('event_title')}
          </h2>
          <div className="grid md:grid-cols-3 items-start mt-4 gap-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t('event_location_label')}
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {t('event_location_value')}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t('event_time_label')}
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {t('event_time_value')}
              </p>
            </div>
            <a
              href={calendarUrl}
              className="inline-flex items-center justify-center rounded-xl border border-cyan-700 px-5 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50 transition-colors"
            >
              {t('cta_calendar')}
            </a>
          </div>

          <iframe
            src={mapEmbedUrl}
            className="mt-6 -mx-5 w-[calc(100%+2.5rem)] sm:-mx-6 sm:w-[calc(100%+3rem)]"
            height="450"
            title={t('event_location_label')}
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border border-cyan-700 px-5 py-3 text-sm font-semibold text-cyan-800 hover:bg-cyan-50 transition-colors"
            >
              {t('cta_route')}
            </a>
            <p className="text-sm text-slate-600">{t('route_hint')}</p>
          </div>
        </div>
      </section>

      <section>
        <SponsorCarousel />
      </section>
    </main>
  );
}
