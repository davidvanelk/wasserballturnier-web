'use client';

import { useChangeLocale, useCurrentLocale } from '@/app/i18n/client';

export default function LocaleSwitcher() {
  const changeLocale = useChangeLocale();
  const locale = useCurrentLocale();

  return (
    <div>
      <select
        title="Select language"
        onChange={(e) =>
          changeLocale((e.target.value ?? 'en') as 'en' | 'de' | 'nl')
        }
        value={locale}
        className="rounded-full border border-[rgba(28,28,28,0.12)] bg-white px-4 py-2 font-semibold text-[var(--brand-ink)] shadow-[0_8px_20px_rgba(28,28,28,0.05)] outline-none hover:border-[var(--brand-red)]"
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="nl">Nederlands</option>
      </select>
    </div>
  );
}
