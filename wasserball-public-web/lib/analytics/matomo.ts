import type { NextRequest } from 'next/server';
import { logger } from '../logger';

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
}: {
  request: NextRequest;
}): Promise<void> {
  const matomoBaseUrl = process.env.MATOMO_URL;
  const matomoSiteId = process.env.MATOMO_SITE_ID;

  const userAgent = request.headers.get('user-agent');
  if (userAgent?.toLowerCase().startsWith('kube-probe/')) {
    return;
  }

  logger.info(
    `[matomo] Invoking tracking event. Matomo URL: ${matomoBaseUrl}, Site ID: ${matomoSiteId}`,
  );

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
  endpoint.searchParams.set('action_name', request.nextUrl.pathname);
  endpoint.searchParams.set('host', request.nextUrl.hostname);
  endpoint.searchParams.set('url', request.url);
  endpoint.searchParams.set('host-header', request.headers.get('host') ?? '');
  endpoint.searchParams.set('_id', visitorId);

  if (request.nextUrl.searchParams.has('utm_source')) {
    endpoint.searchParams.set(
      'utm_source',
      request.nextUrl.searchParams.get('utm_source') as string,
    );
  }
  if (request.nextUrl.searchParams.has('utm_medium')) {
    endpoint.searchParams.set(
      'utm_medium',
      request.nextUrl.searchParams.get('utm_medium') as string,
    );
    endpoint.searchParams.set(
      'mtm_campaign',
      request.nextUrl.searchParams.get('utm_medium') as string,
    );
  }
  if (request.nextUrl.searchParams.has('utm_campaign')) {
    endpoint.searchParams.set(
      'utm_campaign',
      request.nextUrl.searchParams.get('utm_campaign') as string,
    );
  }
  if (request.nextUrl.searchParams.has('utm_term')) {
    endpoint.searchParams.set(
      'utm_term',
      request.nextUrl.searchParams.get('utm_term') as string,
    );
  }
  if (request.nextUrl.searchParams.has('utm_content')) {
    endpoint.searchParams.set(
      'utm_content',
      request.nextUrl.searchParams.get('utm_content') as string,
    );
    endpoint.searchParams.set(
      'mtm_kwd',
      request.nextUrl.searchParams.get('utm_content') as string,
    );
    endpoint.searchParams.set(
      'dimension1',
      request.nextUrl.searchParams.get('utm_content') as string,
    );
  }

  if (userAgent) {
    endpoint.searchParams.set('ua', userAgent);
  }

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
