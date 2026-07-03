import { createCalendarResponse } from '@/lib/calendar/calendar-response';

export async function GET() {
  return createCalendarResponse();
}
