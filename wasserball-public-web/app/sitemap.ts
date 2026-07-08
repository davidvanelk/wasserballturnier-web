import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://wasserball.feuerwehremmerich.de';

  const routes = [
    '',
    '/de/landing',
    '/nl/landing',
    '/en/landing',
    '/de/imprint',
    '/de/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...routes];
}
