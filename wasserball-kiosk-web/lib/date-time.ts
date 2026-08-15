export const BERLIN_TIME_ZONE = "Europe/Berlin";

export function createBerlinDateTimeFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: BERLIN_TIME_ZONE,
  });
}
