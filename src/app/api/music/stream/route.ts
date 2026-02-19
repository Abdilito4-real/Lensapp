import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId');
  
  if (!videoId) {
    return NextResponse.json({ error: 'videoId required' }, { status: 400 });
  }

  try {
    const response = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch stream from piped: ${response.statusText}`);
    }
    const data = await response.json();
    
    // Find the best audio stream (m4a, highest quality)
    const audioStream = data.audioStreams
        .filter((s: any) => s.mimeType === 'audio/mp4')
        .sort((a: any, b: any) => b.bitrate - a.bitrate)[0];

    if (!audioStream?.url) {
        // Fallback to any other audio stream if m4a is not available
        const fallbackStream = data.audioStreams.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
        if (!fallbackStream?.url) {
            throw new Error('No suitable audio stream found.');
        }
        return NextResponse.json({ url: fallbackStream.url });
    }
    
    // Return the stream URL in the expected format
    return NextResponse.json({ url: audioStream.url });
  } catch (error) {
    console.error('Stream proxy error:', error);
    return NextResponse.json({ error: 'Failed to get stream' }, { status: 500 });
  }
}
