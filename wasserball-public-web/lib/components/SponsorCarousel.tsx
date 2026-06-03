import { getScopedI18n } from '@/app/i18n/server';
import { getSponsors } from '../sponsors/sponsor-engine';
import Image from 'next/image';

const SponsorCarousel = async () => {
  const t = await getScopedI18n('sponsoring.carousel');
  const sponsors = [...getSponsors()];

  const sponsorList = (x: number) =>
    sponsors.map(({ sponsor, logo, alt, url }) => (
      <a
        key={sponsor + '-' + x}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block items-center p-4 rounded-lg border border-transparent hover:border-gray-200 transition-colors"
      >
        <Image
          src={logo}
          alt={alt}
          className="h-14 md:h-16 lg:h-24 object-contain mx-auto mb-3"
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

      <div
        className="relative w-full overflow-x-hidden mt-4"
        style={{
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          maskImage:
            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        }}
      >
        <div className="flex w-max animate-marquee">
          <div className="flex gap-3 mx-6">{sponsorList(1)}</div>
          <div className="flex gap-3 mx-6">{sponsorList(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default SponsorCarousel;
