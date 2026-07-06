import type { ReactNode } from 'react';
import FlyerSurface from './FlyerSurface';
import SectionHeader from './SectionHeader';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  children,
}: PageHeroProps) {
  return (
    <FlyerSurface className="px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
      />
      {children ? <div className="mt-8">{children}</div> : null}
    </FlyerSurface>
  );
}
