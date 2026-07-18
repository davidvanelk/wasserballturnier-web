import FamilyRestroomOutlinedIcon from '@mui/icons-material/FamilyRestroomOutlined';
import LocalCafeOutlinedIcon from '@mui/icons-material/LocalCafeOutlined';
import OutdoorGrillOutlinedIcon from '@mui/icons-material/OutdoorGrillOutlined';
import SportsBarOutlinedIcon from '@mui/icons-material/SportsBarOutlined';
import { getScopedI18n } from '@/app/i18n/server';
import FeatureCard from '@/lib/components/FeatureCard';
import FlyerButtonLink from '@/lib/components/FlyerButtonLink';
import FlyerSurface from '@/lib/components/FlyerSurface';
import SectionHeader from '@/lib/components/SectionHeader';
import SponsorCarousel from '@/lib/components/SponsorCarousel';
import { getEuregioText } from '@/lib/strapi/euregio-text';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getScopedI18n('landing');
  const googleMapsApiKey = process.env.GOOGLE_MAPS_EMBED_API_KEY ?? '';
  const directionsUrl =
    'https://www.google.com/maps/dir/?api=1&destination=51.877462,6.150263';
  const calendarUrl = '/api/calendar';
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=51.877462%2C6.150263`;
  const [locationStreet, ...locationRest] = t('event_location_value').split(
    ', ',
  );
  const locationCity = locationRest.join(', ');
  const euregioText = await getEuregioText(await params.then((p) => p.locale));
  const programHighlights = [
    { title: t('feature_family'), icon: FamilyRestroomOutlinedIcon },
    { title: t('feature_coffee'), icon: LocalCafeOutlinedIcon },
    { title: t('feature_drinks'), icon: SportsBarOutlinedIcon },
    { title: t('feature_grill'), icon: OutdoorGrillOutlinedIcon },
  ];

  return (
    <main className="relative flex w-full flex-col gap-8 lg:gap-10">
      <FlyerSurface
        className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12"
        revealDelay={0}
      >
        <div className="absolute -right-24 top-8 h-56 w-56 rounded-full bg-[rgba(214,34,31,0.12)] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[rgba(28,28,28,0.08)] blur-3xl" />

        <div className="relative">
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand-red)]">
            {t('eyebrow')}
          </p>
          <h1 className="mt-4 max-w-4xl font-mono text-5xl font-semibold uppercase leading-[0.95] text-[var(--brand-ink)] sm:text-6xl lg:text-7xl">
            {t('title')}
            <span className="mt-3 block text-[var(--brand-red)]">
              {t('title_2')}
            </span>
          </h1>

          <div className="mt-6 max-w-3xl space-y-3 text-lg leading-8 text-[var(--brand-gray)] sm:text-xl">
            <p>{t('subtitle')}</p>
            <p>{t('subtitle_2')}</p>
            <p className="font-semibold text-[var(--brand-ink)]">
              {t('subtitle_3')}
            </p>
          </div>

          <div>
            <div>
              <div className="mt-8 flex flex-wrap gap-3">
                <FlyerButtonLink href={calendarUrl}>
                  {t('cta_calendar')}
                </FlyerButtonLink>
                <FlyerButtonLink
                  href={directionsUrl}
                  variant="secondary"
                  external
                >
                  {t('cta_route')}
                </FlyerButtonLink>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative flyer-dark-panel justify-center text-white z-10 mt-6 rounded-[1.75rem] bg-white px-5 py-6 text-[var(--brand-ink)] shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                <div className="absolute right-0 top-0 h-100 w-100 translate-x-8 -translate-y-8 rounded-full bg-[rgba(214,34,31,0.1)] blur-2xl" />

                <div className="flex flex-col gap-3 self-center">
                  <div className="flex items-end gap-4">
                    <span className="font-mono text-9xl font-semibold leading-none sm:text-10xl">
                      {t('date_day')}
                    </span>
                    <div className="pb-2">
                      <p className="font-mono text-4xl uppercase leading-none">
                        {t('date_month')}
                      </p>
                      <p className="mt-2 font-mono text-6xl uppercase leading-none text-[var(--brand-red)]">
                        {t('date_year')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-full bg-[var(--brand-red)] px-4 py-3 text-center text-sm font-bold uppercase tracking-[0.12em] text-white">
                    {t('date_time_range')}
                  </div>
                </div>
              </div>
              <div>
                <div className="relative flyer-dark-panel flex flex-col text-white z-10 mt-6 rounded-[1.75rem] px-5 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                  <div className="absolute right-0 top-0 h-100 w-100 translate-x-8 -translate-y-8 rounded-full bg-[rgba(214,34,31,0.1)] blur-2xl" />

                  <div className="flex flex-col gap-3">
                    <p className="font-mono font-bold text-2xl uppercase leading-none sm:text-3xl">
                      {locationStreet}
                    </p>
                    {locationCity ? (
                      <p className="font-mono font-bold uppercase leading-none text-[var(--brand-red)]">
                        {locationCity}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    {googleMapsApiKey ? (
                      <iframe
                        src={mapEmbedUrl}
                        className="mt-6 w-full md:h-auto h-80 rounded-[1.5rem] border border-[rgba(28,28,28,0.08)]"
                        title={t('map_title')}
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    ) : (
                      <div className="mt-6 rounded-[1.5rem] border border-dashed border-[rgba(28,28,28,0.12)] bg-[var(--surface-muted)] p-8">
                        <div className="max-w-xl space-y-3">
                          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--brand-red)]">
                            {t('map_title')}
                          </p>
                          <p className="text-base leading-7 text-[var(--brand-gray)]">
                            {t('route_hint')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(18rem,0.9fr)_minmax(0,1.3fr)] lg:items-stretch"></div>
        </div>
      </FlyerSurface>

      <FlyerSurface id="program" className="p-6 sm:p-8" revealDelay={1}>
        <SectionHeader
          eyebrow={t('program_eyebrow')}
          title={t('program_title')}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {programHighlights.map((highlight) => (
            <FeatureCard
              key={highlight.title}
              title={highlight.title}
              icon={highlight.icon}
            />
          ))}
        </div>
      </FlyerSurface>

      <FlyerSurface
        tone="dark"
        className="px-6 py-8 sm:px-8 sm:py-10"
        revealDelay={2}
      >
        <div className="flex flex-col gap-6 text-white">
          <SponsorCarousel />
        </div>
      </FlyerSurface>
      {euregioText && (
        <FlyerSurface id="euregio" className="p-6 sm:p-8" revealDelay={1}>
          <SectionHeader title={euregioText.heading} />
          <p className="mt-6">{euregioText.text}</p>
          <div className="flex mt-6 gap-4 flex-wrap items-center justify-center">
            <Image
              className="h-30 w-auto"
              src={euregioText.interregLogoUrl}
              alt="Interreg Logo"
              width={400}
              height={96}
            />
            <Image
              className="h-30 w-auto"
              src={euregioText.euregioLogoUrl}
              alt="Euregio Logo"
              width={400}
              height={96}
            />
          </div>
        </FlyerSurface>
      )}
    </main>
  );
}
