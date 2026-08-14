import type { ElementType } from 'react';
import Link from 'next/link';

type LandingLinkCardProps = {
  href: string;
  title: string;
  text: string;
  linkLabel: string;
  icon: ElementType;
};

export default function LandingLinkCard({
  href,
  title,
  text,
  linkLabel,
  icon: Icon,
}: LandingLinkCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-[1.5rem] border border-[rgba(28,28,28,0.08)] bg-white p-5 shadow-[0_12px_28px_rgba(28,28,28,0.06)] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-red)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-red)] text-white">
        <Icon aria-hidden="true" className="text-[28px]" />
      </div>
      <h2 className="mt-4 font-mono text-xl font-bold uppercase text-[var(--brand-ink)]">
        {title}
      </h2>
      <p className="mt-2 flex-grow text-base leading-7 text-[var(--brand-gray)]">
        {text}
      </p>
      <span className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-[var(--brand-red)] group-hover:text-[var(--brand-red-dark)]">
        {linkLabel} →
      </span>
    </Link>
  );
}
