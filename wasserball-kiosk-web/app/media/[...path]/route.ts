import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const strapiUrl = process.env.STRAPI_URL?.replace(/\/$/, '');
  const { path } = await params;
  if (!strapiUrl || path[0] !== 'uploads') {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const response = await fetch(`${strapiUrl}/${path.map(encodeURIComponent).join('/')}`, {
      next: { revalidate: 600 },
    });
    if (!response.ok) return new NextResponse(null, { status: response.status });

    return new NextResponse(response.body, {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'Content-Type': response.headers.get('Content-Type') ?? 'application/octet-stream',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
