import { NextRequest, NextResponse } from 'next/server';

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
];

async function getStreamFromPiped(videoId: string) {
  for (const instance of PIPED_INSTANCES) {
    try {
      const meta = await fetch(`${instance}/streams/${videoId}`).then(res => {
        if (!res.ok) throw new Error(`Request to ${instance} failed with status ${res.status}`);
        return res.json();
      });
      const audioStream = meta.audioStreams
        ?.sort((a: any, b: any) => b.bitrate - a.bitrate)
        .find((s: any) => s.mimeType?.includes('audio'));
      
      if (audioStream?.url) {
        console.log(`[stream-proxy] Using Piped instance: ${instance}`);
        return audioStream;
      }
    } catch (e) {
      console.error(`[stream-proxy] Piped instance ${instance} failed:`, e);
      // continue to next instance
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('videoId');
  if (!videoId) {
    return new NextResponse('Missing videoId', { status: 400 });
  }

  try {
    const audioStream = await getStreamFromPiped(videoId);
    if (!audioStream?.url) {
      return new NextResponse('No audio stream found from any Piped instance', { status: 404 });
    }

    // Proxy with range request support
    const rangeHeader = req.headers.get('range');
    const upstreamRes = await fetch(audioStream.url, {
      headers: rangeHeader ? { 'Range': rangeHeader } : {},
    });

    if (!upstreamRes.ok) {
       console.error(`[stream-proxy] Upstream fetch failed with status: ${upstreamRes.status}`);
       return new NextResponse(upstreamRes.body, { status: upstreamRes.status, statusText: upstreamRes.statusText });
    }

    const headers = new Headers(upstreamRes.headers);
    // Ensure correct content type and allow range requests
    headers.set('Content-Type', audioStream.mimeType ?? 'audio/webm');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'no-store');

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      statusText: upstreamRes.statusText,
      headers: headers,
    });
  } catch (error) {
    console.error('[stream-proxy] Internal error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    },
  });
}
