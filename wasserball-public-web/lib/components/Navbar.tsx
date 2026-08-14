'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCurrentLocale, useScopedI18n } from '@/app/i18n/client';
import LocaleSwitcher from './LocaleSwitcher';

const links = [
  { href: '/landing', label: 'home' },
  { href: '/standings', label: 'standings' },
  { href: '/matches', label: 'matches' },
  { href: '/teams', label: 'teams' },
  { href: '/price-list', label: 'price_list' },
] as const;

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const locale = useCurrentLocale();
  const pathname = usePathname();
  const t = useScopedI18n('navbar');

  const isActive = (href: string) => {
    const localizedHref = `/${locale}${href}`;
    return (
      pathname === localizedHref || pathname.startsWith(`${localizedHref}/`)
    );
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full px-4 pt-4 sm:px-3 lg:px-8"
      aria-label={t('title')}
    >
      <div className="mx-auto max-w-7xl rounded-[1.5rem] border border-[var(--brand-line)] bg-[rgba(255,255,255,0.88)] px-4 shadow-[0_12px_32px_rgba(28,28,28,0.09)] backdrop-blur-xl sm:px-6">
        <div className="flex min-h-16 items-center justify-between gap-4">
          <Link
            href={`/${locale}/landing`}
            className="font-mono text-lg font-semibold uppercase tracking-[0.08em] text-[var(--brand-ink)] hover:text-[var(--brand-red)]"
          >
            {t('title')}
          </Link>

          <div className="hidden items-stretch self-stretch md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`relative flex items-center px-4 text-sm font-bold uppercase tracking-[0.1em] transition-colors after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:rounded-full ${
                  isActive(link.href)
                    ? 'text-[var(--brand-red)] after:bg-[var(--brand-red)]'
                    : 'text-[var(--brand-gray)] after:bg-transparent hover:text-[var(--brand-ink)]'
                }`}
              >
                {t(link.label)}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(28,28,28,0.12)] bg-white text-[var(--brand-ink)] hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-red)] md:hidden"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">{t('open_menu')}</span>
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth="2"
                  d={
                    isMenuOpen
                      ? 'M6 6l12 12M18 6 6 18'
                      : 'M4 7h16M4 12h16M4 17h16'
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div
            className="border-t border-[var(--brand-line)] py-3 md:hidden"
            id="mobile-menu"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={`/${locale}${link.href}`}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`my-1 block rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-[0.12em] ${
                  isActive(link.href)
                    ? 'bg-[var(--brand-red)] text-white'
                    : 'text-[var(--brand-gray)] hover:bg-[var(--surface-muted)] hover:text-[var(--brand-ink)]'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t(link.label)}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
