import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://verome-api.deno.dev';

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId');
  
  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
  }

  try {
    // The verome API uses 'id' for the video ID in the stream endpoint
    const apiUrl = `${BASE_URL}/api/stream?id=${encodeURIComponent(videoId)}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch from verome stream API (${apiUrl}): ${response.status}`, errorText);
        throw new Error(`Failed to fetch from verome stream API: ${response.statusText}`);
    }
    
    // Assuming the API returns a JSON object with a 'url' property, which we will just forward.
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Stream proxy error:', error);
    return NextResponse.json({ error: 'Failed to get stream' }, { status: 500 });
  }
}
