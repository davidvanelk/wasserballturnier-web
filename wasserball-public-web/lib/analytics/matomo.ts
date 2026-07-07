import type { NextRequest } from 'next/server';
import { logger } from '../logger';

export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export type UtmPayload = Partial<Record<(typeof UTM_KEYS)[number], string>>;

function getClientIp(request: NextRequest): string | undefined {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return undefined;
}

function anonymizeIp(ip?: string): string | undefined {
  if (!ip) {
    return undefined;
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    const parts = ip.split('.');
    parts[3] = '0';
    return parts.join('.');
  }

  if (ip.includes(':')) {
    const segments = ip.split(':');

    while (segments.length < 8) {
      segments.push('0');
    }

    for (let i = 4; i < 8; i += 1) {
      segments[i] = '0000';
    }

    return segments.join(':');
  }

  return undefined;
}

export function extractUtmParams(url: URL): UtmPayload {
  const payload: UtmPayload = {};

  for (const key of UTM_KEYS) {
    const value = url.searchParams.get(key);
    if (value) {
      payload[key] = value;
    }
  }

  return payload;
}

function buildTrackedUrl(nextUrl: URL, utmPayload: UtmPayload): string {
  const trackedUrl = new URL(nextUrl.pathname + nextUrl.search, nextUrl.origin);

  for (const key of UTM_KEYS) {
    if (!trackedUrl.searchParams.has(key) && utmPayload[key]) {
      trackedUrl.searchParams.set(key, utmPayload[key] as string);
    }
  }

  return trackedUrl.toString();
}

function shouldTrackRequest(request: NextRequest): boolean {
  if (request.method !== 'GET') {
    return false;
  }

  const userAgent = (request.headers.get('user-agent') ?? '').toLowerCase();
  if (/(bot|spider|crawler|preview)/.test(userAgent)) {
    return false;
  }

  // Skip Next.js internal prefetch requests
  const purpose =
    request.headers.get('next-router-prefetch') ??
    request.headers.get('purpose') ??
    '';
  if (purpose === 'prefetch') {
    return false;
  }

  return true;
}

async function createCookielessVisitorId(seed: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(seed),
  );
  const bytes = new Uint8Array(digest).slice(0, 8);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

async function resolveVisitorId(request: NextRequest): Promise<string> {
  const userAgent = request.headers.get('user-agent') ?? 'unknown';
  const anonymizedIp = anonymizeIp(getClientIp(request));

  if (anonymizedIp) {
    const today = new Date().toISOString().slice(0, 10);
    return createCookielessVisitorId(`${anonymizedIp}|${userAgent}|${today}`);
  }

  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

export async function sendMatomoPageViewTracking({
  request,
  utmPayload,
}: {
  request: NextRequest;
  utmPayload: UtmPayload;
}): Promise<void> {
  const matomoBaseUrl = process.env.MATOMO_URL;
  const matomoSiteId = process.env.MATOMO_SITE_ID;

  if (!matomoBaseUrl || !matomoSiteId || !shouldTrackRequest(request)) {
    return;
  }

  const visitorId = await resolveVisitorId(request);

  const endpoint = new URL(
    'matomo.php',
    matomoBaseUrl.endsWith('/') ? matomoBaseUrl : `${matomoBaseUrl}/`,
  );
  endpoint.searchParams.set('idsite', matomoSiteId);
  endpoint.searchParams.set('rec', '1');
  endpoint.searchParams.set('apiv', '1');
  endpoint.searchParams.set('rand', String(Math.random()));
  endpoint.searchParams.set(
    'url',
    buildTrackedUrl(request.nextUrl, utmPayload),
  );
  endpoint.searchParams.set('action_name', request.nextUrl.pathname);
  endpoint.searchParams.set('_id', visitorId);

  const tokenAuth = process.env.MATOMO_TOKEN_AUTH;
  if (tokenAuth) {
    endpoint.searchParams.set('token_auth', tokenAuth);
  }

  const lang = request.headers.get('accept-language')?.split(',')[0];
  if (lang) {
    endpoint.searchParams.set('lang', lang);
  }

  const referer = request.headers.get('referer');
  if (referer) {
    endpoint.searchParams.set('urlref', referer);
  }

  const userAgent = request.headers.get('user-agent');
  if (userAgent) {
    endpoint.searchParams.set('ua', userAgent);
  }

  const ip = getClientIp(request);

  if (ip) {
    endpoint.searchParams.set('cip', ip);
  }

  logger.info(`[matomo] sending tracking request to: ${endpoint.toString()}`);

  try {
    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      cache: 'no-store',
    });
    if (!response.ok) {
      logger.error(
        `[matomo] tracking request failed: ${response.status} ${response.statusText}: ${await response.text()}`,
      );
    } else {
      logger.info('[matomo] tracking request succeeded');
    }
  } catch (err) {
    logger.error('[matomo] tracking request threw:', err);
  }
}
