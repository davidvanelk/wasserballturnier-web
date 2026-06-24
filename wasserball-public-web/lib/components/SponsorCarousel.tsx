import { getScopedI18n } from '@/app/i18n/server';
import { getSponsors } from '../sponsors/sponsor-engine';
import Image from 'next/image';

const SponsorCarousel = async () => {
  const t = await getScopedI18n('sponsoring.carousel');
  const sponsors = [...getSponsors()];
  const repeatCount = 4;

  const sponsorList = (x: number) =>
    sponsors.map(({ sponsor, logo, alt, url }) => (
      <a
        key={sponsor + '-' + x}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-transparent p-4 transition-colors hover:border-gray-200"
      >
        <Image
          src={logo}
          alt={alt}
          className="h-12 md:h-18 lg:h-30 object-contain mx-auto mb-3"
          width={150}
          height={150}
        />
        {sponsor}
      </a>
    ));

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-90">{t('title')}</h2>
      <p className="text-lg text-slate-700 mt-4">{t('subtitle')}</p>

      <div className="sponsor-marquee relative mt-6 w-full overflow-x-hidden">
        <div className="sponsor-marquee-track flex w-max gap-3 animate-marquee">
          {Array.from({ length: repeatCount }, (_, index) => (
            <div key={index} className="flex shrink-0 gap-3">
              {sponsorList(index + 1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorCarousel;
