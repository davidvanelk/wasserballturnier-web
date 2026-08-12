'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MATCH_HISTORY_KEY } from './MatchLink';

type HistoryBackButtonProps = {
  fallbackHref: string;
  backLabel: string;
  fallbackLabel: string;
};

function hasRecordedMatchHistory() {
  const serializedNavigation = sessionStorage.getItem(MATCH_HISTORY_KEY);
  if (!serializedNavigation || window.history.length <= 1) return false;

  try {
    const navigation: unknown = JSON.parse(serializedNavigation);
    return (
      typeof navigation === 'object' &&
      navigation !== null &&
      'destination' in navigation &&
      navigation.destination === window.location.pathname
    );
  } catch {
    sessionStorage.removeItem(MATCH_HISTORY_KEY);
    return false;
  }
}

export default function HistoryBackButton({
  fallbackHref,
  backLabel,
  fallbackLabel,
}: HistoryBackButtonProps) {
  const router = useRouter();
  const canGoBack = useSyncExternalStore(
    () => () => undefined,
    hasRecordedMatchHistory,
    () => false,
  );

  const className =
    'inline-flex items-center justify-center rounded-full border border-[rgba(28,28,28,0.14)] bg-transparent px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[var(--brand-ink)] hover:-translate-y-0.5 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]';

  if (!canGoBack) {
    return (
      <Link className={className} href={fallbackHref}>
        ← {fallbackLabel}
      </Link>
    );
  }

  return (
    <button
      className={className}
      onClick={() => {
        sessionStorage.removeItem(MATCH_HISTORY_KEY);
        router.back();
      }}
      type="button"
    >
      ← {backLabel}
    </button>
  );
}
