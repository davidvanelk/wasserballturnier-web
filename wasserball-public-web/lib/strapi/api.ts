import { logger } from '../logger';

const DEFAULT_STRAPI_BROWSER_PATH = '/cms';
const STRAPI_URL = getStrapiUrl();
const STRAPI_PUBLIC_URL = getStrapiPublicUrl();

function getStrapiUrl() {
  const baseUrl = process.env.STRAPI_URL?.trim();

  if (!baseUrl) {
    return null;
  }

  return baseUrl.replace(/\/$/, '');
}

function getStrapiPublicUrl() {
  const baseUrl = process.env.STRAPI_PUBLIC_URL?.trim();

  if (!baseUrl) {
    return DEFAULT_STRAPI_BROWSER_PATH;
  }

  return baseUrl.replace(/\/$/, '') || DEFAULT_STRAPI_BROWSER_PATH;
}

export function toBrowserMediaUrl(url: string) {
  if (!url) {
    return '';
  }

  const publicUrl = getStrapiPublicUrl();

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  if (publicUrl && url.startsWith('/')) {
    return `${publicUrl}${url}`;
  }

  return url;
}

export async function getStrapiContent<T>(
  contentTypePlural: string,
  queryParams?: Record<string, string>,
  requestInit?: RequestInit,
) {
  const queryString = queryParams
    ? '?' + new URLSearchParams(queryParams).toString()
    : '';

  const endpoint = `${STRAPI_URL}/api/${contentTypePlural}${queryString}`;
  const response = await fetch(endpoint, requestInit);

  logger.info(`Fetching Strapi content from: ${endpoint}`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Strapi content from ${endpoint}: [${response.status} (${response.statusText})]: ${await response.text()}`,
    );
  }
  const payload = (await response.json()).data as T;
  return payload;
}
