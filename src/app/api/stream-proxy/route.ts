import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return new Response('Missing url', { status: 400 });

  const rangeHeader = req.headers.get('range');
  const upstream = await fetch(decodeURIComponent(url), {
    headers: rangeHeader ? { range: rangeHeader } : {},
  });

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') ?? 'audio/webm',
      'Content-Length': upstream.headers.get('Content-Length') ?? '',
      'Content-Range': upstream.headers.get('Content-Range') ?? '',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    },
  });
}
