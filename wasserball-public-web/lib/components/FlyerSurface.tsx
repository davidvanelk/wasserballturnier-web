import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from './utils';

type FlyerSurfaceProps<T extends ElementType = 'section'> = {
  as?: T;
  tone?: 'light' | 'dark';
  revealDelay?: 0 | 1 | 2 | 3;
  className?: string;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

const revealDelayClassMap = {
  0: '',
  1: 'section-reveal-delay-1',
  2: 'section-reveal-delay-2',
  3: 'section-reveal-delay-3',
} as const;

export default function FlyerSurface<T extends ElementType = 'section'>({
  as,
  tone = 'light',
  revealDelay,
  className,
  children,
  ...restProps
}: FlyerSurfaceProps<T>) {
  const Component = (as ?? 'section') as ElementType;

  return (
    <Component
      {...restProps}
      className={cn(
        'overflow-hidden rounded-[2rem]',
        tone === 'dark' ? 'flyer-dark-panel' : 'flyer-panel',
        revealDelay !== undefined && 'section-reveal',
        revealDelay !== undefined && revealDelayClassMap[revealDelay],
        className,
      )}
    >
      {children}
    </Component>
  );
}
