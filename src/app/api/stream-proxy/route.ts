import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId');
  if (!videoId) {
    return new NextResponse('Missing videoId', { status: 400 });
  }

  try {
    console.log(`[stream-proxy] Fetching stream info for videoId: ${videoId}`);
    
    // 1. Get the stream metadata from Verome API
    const streamRes = await fetch(`https://verome-api.deno.dev/api/stream?id=${videoId}`);
    if (!streamRes.ok) {
      console.error('[stream-proxy] Verome API error:', streamRes.status, await streamRes.text());
      return new NextResponse('Failed to get stream info', { status: 500 });
    }
    
    const data = await streamRes.json();
    console.log('[stream-proxy] Verome API response keys:', Object.keys(data));

    // 2. Extract a playable audio URL
    let audioUrl: string | null = null;

    // The API returns an array `streamingUrls` with different audio formats.
    if (data.streamingUrls && Array.isArray(data.streamingUrls) && data.streamingUrls.length > 0) {
      // Prefer itag 251 (opus high quality) or 140 (m4a aac), otherwise take the first.
      const preferredItags = ['251', '140']; // in order of preference
      let selected = data.streamingUrls.find((item: any) => 
        preferredItags.includes(String(item.itag)) && item.directUrl
      );
      if (!selected) {
        selected = data.streamingUrls.find((item: any) => item.directUrl || item.url); // fallback to first with a URL
      }
      if (selected) {
        // Use directUrl if available, else url
        audioUrl = selected.directUrl || selected.url;
        console.log('[stream-proxy] Selected format itag:', selected.itag);
      }
    }

    if (!audioUrl) {
      console.error('[stream-proxy] No playable audio URL found in response');
      return new NextResponse('No audio URL available', { status: 500 });
    }

    console.log('[stream-proxy] Fetching audio from:', audioUrl);

    // 3. Fetch the audio stream with appropriate headers
    const audioRes = await fetch(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Range': request.headers.get('range') || '',
        'Referer': 'https://verome-api.deno.dev/',
      },
    });

    if (!audioRes.ok && audioRes.status !== 206) {
      console.error('[stream-proxy] Audio fetch failed:', audioRes.status, await audioRes.text());
      return new NextResponse('Audio source error', { status: audioRes.status });
    }
    
    const contentType = audioRes.headers.get('content-type');
    if (!contentType || (!contentType.startsWith('audio/') && !contentType.startsWith('video/'))) {
      console.error('[stream-proxy] Upstream response is not audio/video. Content-Type:', contentType);
      return new NextResponse('Invalid content type from upstream', { status: 502 });
    }

    // 4. Prepare response headers
    const headers = new Headers(audioRes.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Range');
    headers.set('content-type', contentType);

    console.log('[stream-proxy] Streaming audio, status:', audioRes.status);
    return new NextResponse(audioRes.body, {
      status: audioRes.status,
      statusText: audioRes.statusText,
      headers,
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
