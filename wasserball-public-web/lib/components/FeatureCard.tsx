import type { ElementType } from 'react';

type FeatureCardProps = {
  title: string;
  icon?: ElementType;
  text?: string;
  className?: string;
  iconClassName?: string;
};

export default function FeatureCard({
  title,
  icon: Icon,
  text,
  className,
  iconClassName = 'text-[28px]',
}: FeatureCardProps) {
  return (
    <div
      className={
        className ??
        'rounded-[1.5rem] border border-[rgba(28,28,28,0.08)] bg-white p-5 shadow-[0_12px_28px_rgba(28,28,28,0.06)]'
      }
    >
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-red)] text-white">
          <Icon aria-hidden="true" className={iconClassName} />
        </div>
      ) : null}
      <p className="mt-4 font-semibold uppercase tracking-[0.08em] text-[var(--brand-ink)]">
        {title}
      </p>
      {text ? (
        <p className="mt-2 text-base leading-7 text-[var(--brand-gray)]">
          {text}
        </p>
      ) : null}
    </div>
  );
}
