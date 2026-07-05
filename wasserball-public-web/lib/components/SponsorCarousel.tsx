import { getScopedI18n } from '@/app/i18n/server';
import { getSponsors } from '../sponsors/sponsor-engine';
import Image from 'next/image';
import SectionHeader from './SectionHeader';

const SponsorCarousel = async () => {
  const t = await getScopedI18n('sponsoring.carousel');
  const sponsors = [...(await getSponsors())];
  const repeatCount = 4;

  const sponsorList = (x: number) =>
    sponsors.map(({ sponsor, logo, alt, url }) => (
      <a
        key={sponsor + '-' + x}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block min-w-44 rounded-[1.5rem] border border-white/8 bg-white/6 p-4 text-center text-white/88 backdrop-blur-sm transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
      >
        <Image
          src={logo}
          alt={alt}
          className="mx-auto mb-3 h-12 object-contain md:h-18 lg:h-20"
          width={150}
          height={150}
        />
        <span className="text-sm font-medium leading-6">{sponsor}</span>
      </a>
    ));

  return (
    <div>
      <SectionHeader
        eyebrow={t('title')}
        title={t('title')}
        description={t('subtitle')}
        inverted
        titleClassName="sr-only"
      />

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
