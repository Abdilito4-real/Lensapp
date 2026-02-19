import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId');
  if (!videoId) {
    return new NextResponse('Missing videoId', { status: 400 });
  }

  try {
    // 1. Get the stream URL from Verome API
    const streamRes = await fetch(`https://verome-api.deno.dev/api/stream?id=${videoId}`);
    if (!streamRes.ok) {
      return new NextResponse('Failed to get stream URL', { status: 500 });
    }
    const { url } = await streamRes.json();
    if (!url) {
      return new NextResponse('No stream URL', { status: 500 });
    }

    // 2. Fetch the audio stream
    const audioRes = await fetch(url, {
      headers: {
        // Forward range headers if present (for seeking)
        range: request.headers.get('range') || '',
      },
    });

    // 3. Return the audio stream with proper headers
    const headers = new Headers(audioRes.headers);
    headers.set('Access-Control-Allow-Origin', '*'); // Allow any origin (your PWA)
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Range');

    return new NextResponse(audioRes.body, {
      status: audioRes.status,
      statusText: audioRes.statusText,
      headers,
    });
  } catch (error) {
    console.error('Stream proxy error:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

// Handle OPTIONS preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    },
  });
}
