import { NextRequest } from 'next/server';

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://piped-api.garudalinux.org',
];

const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://invidious.privacydev.net',
  'https://yt.cdaut.de',
];

async function getAudioUrlFromPiped(videoId: string): Promise<{ url: string; mimeType: string } | null> {
  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const meta = await res.json();
      const stream = meta.audioStreams
        ?.sort((a: any, b: any) => b.bitrate - a.bitrate)
        .find((s: any) => s.mimeType?.includes('audio'));
      if (stream?.url) return { url: stream.url, mimeType: stream.mimeType };
    } catch {}
  }
  return null;
}

async function getAudioUrlFromInvidious(videoId: string): Promise<{ url: string; mimeType: string } | null> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(`${instance}/api/v1/videos/${videoId}`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;
      const meta = await res.json();
      const stream = meta.adaptiveFormats
        ?.filter((f: any) => f.type?.includes('audio'))
        .sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
      if (stream?.url) return { url: stream.url, mimeType: stream.type?.split(';')[0] ?? 'audio/webm' };
    } catch {}
  }
  return null;
}

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('videoId');
  if (!videoId) return new Response('Missing videoId', { status: 400 });

  try {
    const audio =
      (await getAudioUrlFromPiped(videoId)) ??
      (await getAudioUrlFromInvidious(videoId));

    if (!audio) {
      console.error(`[stream-proxy] All instances failed for videoId: ${videoId}`);
      return new Response('No audio stream found from any instance', { status: 404 });
    }

    console.log(`[stream-proxy] Streaming from: ${audio.url.slice(0, 80)}...`);

    const rangeHeader = req.headers.get('range');
    const upstream = await fetch(audio.url, {
      headers: rangeHeader ? { range: rangeHeader } : {},
      signal: AbortSignal.timeout(15000),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type': audio.mimeType,
        'Content-Length': upstream.headers.get('Content-Length') ?? '',
        'Content-Range': upstream.headers.get('Content-Range') ?? '',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[stream-proxy] Error:', e);
    return new Response('Failed to stream audio', { status: 500 });
  }
}
