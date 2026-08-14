import Image from 'next/image';
import { getScopedI18n } from '@/app/i18n/server';
import {
  getSponsors,
  selectWeightedSponsor,
} from '@/lib/sponsors/sponsor-engine';
import FlyerSurface from './FlyerSurface';

export default async function SponsorAdvertisement() {
  const [sponsors, t] = await Promise.all([
    getSponsors(),
    getScopedI18n('sponsoring.advertisement'),
  ]);
  const sponsor = selectWeightedSponsor(sponsors);

  if (!sponsor) {
    return null;
  }

  return (
    <FlyerSurface
      aria-label={`${t('presented_by')} ${sponsor.sponsor}`}
      className="px-5 py-6 sm:px-8"
      tone="dark"
    >
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-white/64">
        {t('presented_by')}
      </p>
      <a
        className="group mx-auto block w-full max-w-64 text-center text-white/88"
        href={sponsor.url}
        rel="noopener noreferrer"
        target="_blank"
      >
        <Image
          alt={sponsor.alt}
          className="mx-auto mb-3 h-24 object-contain transition-transform group-hover:scale-105 sm:h-16"
          height={100}
          src={sponsor.logo}
          width={240}
        />
        <span className="text-sm font-medium leading-6">{sponsor.sponsor}</span>
      </a>
    </FlyerSurface>
  );
}
