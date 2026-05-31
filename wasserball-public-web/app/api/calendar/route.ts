import { NextResponse } from 'next/server';

const ICS_CONTENT = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Wasserballturnier//Public Web//DE',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'BEGIN:VEVENT',
  'UID:wasserballturnier-2026-0815@wasserball-public-web',
  'DTSTAMP:20260531T000000Z',
  'DTSTART:20260815T090000Z',
  'DTEND:20260815T160000Z',
  'SUMMARY:Wasserballturnier 2026',
  'LOCATION:Haagsche Straße 2\, 46446 Emmerich am Rhein',
  'DESCRIPTION:Wasserballturnier 2026 in Emmerich am Rhein',
  'END:VEVENT',
  'END:VCALENDAR',
].join('\r\n');

export async function GET() {
  return new NextResponse(ICS_CONTENT, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition':
        'attachment; filename="wasserballturnier-2026.ics"',
      'Cache-Control': 'no-store',
    },
  });
}
