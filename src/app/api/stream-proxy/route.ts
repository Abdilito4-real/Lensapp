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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Range': request.headers.get('range') || '',
        'Referer': 'https://verome-api.deno.dev/',
      },
    });

    if (!audioRes.ok && audioRes.status !== 206) { // 206 is partial content (range request)
      console.error('Audio fetch failed:', audioRes.status);
      return new NextResponse('Audio source error', { status: audioRes.status });
    }
    
    // 3. Verify content type from upstream
    const contentType = audioRes.headers.get('content-type');
    if (!contentType || (!contentType.startsWith('audio/') && !contentType.startsWith('video/'))) {
      console.error('Upstream response is not audio/video. Content-Type:', contentType);
      return new NextResponse('Invalid content type from upstream', { status: 502 });
    }

    // 4. Prepare response headers
    const headers = new Headers(audioRes.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Range');
    
    // Ensure the content-type is passed along
    headers.set('content-type', contentType);

    // 5. Return the audio stream
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
