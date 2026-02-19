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
      console.error('Verome API error:', streamRes.status, await streamRes.text());
      return new NextResponse('Failed to get stream URL', { status: 500 });
    }
    
    const { url } = await streamRes.json();
    if (!url) {
      return new NextResponse('No stream URL returned', { status: 500 });
    }

    // 2. Fetch the audio stream with proper headers
    const audioRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Lens/1.0)',
        'Accept': 'audio/*, */*',
        'Range': request.headers.get('range') || '',
      },
    });

    if (!audioRes.ok && audioRes.status !== 206) { // 206 is partial content (range request)
      console.error('Audio fetch failed:', audioRes.status);
      return new NextResponse('Audio source error', { status: audioRes.status });
    }

    // 3. Prepare response headers
    const headers = new Headers(audioRes.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Range');

    // If the upstream didn't set a content-type, try to guess or set a safe default
    if (!headers.has('content-type')) {
      const ext = url.split('.').pop()?.toLowerCase();
      if (ext === 'mp3') headers.set('content-type', 'audio/mpeg');
      else if (ext === 'm4a') headers.set('content-type', 'audio/mp4');
      else if (ext === 'ogg') headers.set('content-type', 'audio/ogg');
      else headers.set('content-type', 'audio/mpeg'); // fallback
    }

    // 4. Return the audio stream
    return new NextResponse(audioRes.body, {
      status: audioRes.status,
      statusText: audioRes.statusText,
      headers,
    });
  } catch (error) {
    console.error('Stream proxy error:', error);
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
