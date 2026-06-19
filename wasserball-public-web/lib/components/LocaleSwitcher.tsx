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
        className="p-2 border border-cyan-700 rounded-md font-bold text-cyan-800 hover:bg-cyan-50 transition-colors"
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="nl">Nederlands</option>
      </select>
    </div>
  );
}
