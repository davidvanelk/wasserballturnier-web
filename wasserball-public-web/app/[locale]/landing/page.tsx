import { getScopedI18n } from '@/app/i18n/server';
import SponsorCarousel from '@/lib/components/SponsorCarousel';

export default async function LandingPage() {
  const t = await getScopedI18n('landing');
  const googleMapsApiKey = process.env.GOOGLE_MAPS_EMBED_API_KEY ?? '';
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=51.877462,6.150263';
  const calendarUrl = '/api/calendar';
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=51.877462%2C6.150263`;

  return (
    <main className="relative overflow-hidden">
      <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <p className="text-sm uppercase tracking-[0.25em] text-cyan-700 font-semibold">
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 text-4xl sm:text-6xl font-black leading-tight text-slate-900 max-w-4xl">
          {t('title')}
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-700 max-w-2xl">
          {t('subtitle')}
        </p>
        <p className="mt-4 text-lg sm:text-xl text-slate-700 max-w-2xl">
          {t('subtitle_2')}
        </p>
        <p className="mt-4 text-lg sm:text-xl text-slate-700 max-w-2xl">
          {t('subtitle_3')}
        </p>

        <div className="mt-8 rounded-2xl border border-cyan-100 bg-white/85 p-5 sm:p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            {t('event_title')}
          </h2>
          <div className="grid md:grid-cols-3 items-start mt-4 gap-3">
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

      <section className="mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <SponsorCarousel />
      </section>

      <section className="mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="rounded-2xl border border-cyan-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
            <p className="text-sm font-semibold text-cyan-700">01</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {t('card_one_title')}
            </h2>
            <p className="mt-2 text-slate-600">{t('card_one_text')}</p>
          </article>
          <article className="rounded-2xl border border-amber-100 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
            <p className="text-sm font-semibold text-amber-700">02</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {t('card_two_title')}
            </h2>
            <p className="mt-2 text-slate-600">{t('card_two_text')}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">03</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {t('card_three_title')}
            </h2>
            <p className="mt-2 text-slate-600">{t('card_three_text')}</p>
          </article>
        </div>
      </section>
    </main>
  );
}
