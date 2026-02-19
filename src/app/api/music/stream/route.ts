import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId');
  
  if (!videoId) {
    return NextResponse.json({ error: 'videoId required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://verome-api.deno.dev/api/stream?id=${videoId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch stream: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Return the stream URL
    return NextResponse.json(data);
  } catch (error) {
    console.error('Stream proxy error:', error);
    return NextResponse.json({ error: 'Failed to get stream' }, { status: 500 });
  }
}
