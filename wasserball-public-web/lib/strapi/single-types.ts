import { getStrapiContent } from './api';

export async function getSingleTypeContent<T>(
  contentType: string,
  queryParams?: Record<string, string>,
): Promise<T | null> {
  const content = await getStrapiContent<T>(contentType, queryParams);
  return content;
}
