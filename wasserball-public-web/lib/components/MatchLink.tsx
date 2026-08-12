'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

export const MATCH_HISTORY_KEY = 'wasserball:match-navigation';

type MatchLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
};

export default function MatchLink({
  href,
  className,
  children,
}: MatchLinkProps) {
  const rememberSource = () => {
    sessionStorage.setItem(
      MATCH_HISTORY_KEY,
      JSON.stringify({
        destination: new URL(href, window.location.origin).pathname,
        source: `${window.location.pathname}${window.location.search}`,
      }),
    );
  };

  return (
    <Link className={className} href={href} onClick={rememberSource}>
      {children}
    </Link>
  );
}
