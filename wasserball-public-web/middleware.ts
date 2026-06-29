import { createI18nMiddleware } from 'next-international/middleware';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import {
  extractUtmParams,
  sendMatomoPageViewTracking,
} from '@/lib/analytics/matomo';

const locales = ['en', 'de', 'nl'] as const;
type Locale = (typeof locales)[number];

const I18nMiddleware = createI18nMiddleware({
  locales,
  defaultLocale: 'de',
});

function getPreferredLocale(request: NextRequest): Locale {
  const cookieLocale =
    request.cookies.get('NEXT_LOCALE')?.value ??
    request.cookies.get('next-locale')?.value;

  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const languageCandidates = acceptLanguage
    .split(',')
    .map((entry) => entry.trim().split(';')[0]?.toLowerCase())
    .filter(Boolean)
    .map((lang) => lang!.split('-')[0]);

  const matchedLocale = languageCandidates.find((lang) =>
    locales.includes(lang as Locale),
  );

  return (matchedLocale as Locale) ?? 'de';
}

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const utmPayload = extractUtmParams(request.nextUrl);

  event.waitUntil(
    sendMatomoPageViewTracking({
      request,
      utmPayload,
    }),
  );

  if (request.nextUrl.pathname === '/') {
    const locale = getPreferredLocale(request);
    return NextResponse.redirect(new URL(`/${locale}/landing`, request.url));
  }

  return I18nMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
