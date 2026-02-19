import { NextRequest, NextResponse } from 'next/server';

async function getToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials are not set in environment variables.');
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Failed to fetch Spotify token: ${error.error_description || res.statusText}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function GET(req: NextRequest) {
  const title = req.nextUrl.searchParams.get('title');
  const artist = req.nextUrl.searchParams.get('artist');

  if (!title) {
    return NextResponse.json({ error: 'Missing title' }, { status: 400 });
  }

  try {
    const token = await getToken();
    const q = encodeURIComponent(`track:${title} artist:${artist ?? ''}`);
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      const text = await res.text();
      let errorMessage = text;
      try {
        const error = JSON.parse(text);
        errorMessage = error.error?.message || text;
      } catch (e) {
        // Not JSON, use original text
      }
      console.error('Spotify search error:', errorMessage);
      return NextResponse.json(
        { error: errorMessage },
        { status: res.status }
      );
    }

    const data = await res.json();
    const previewUrl = data.tracks?.items?.[0]?.preview_url ?? null;

    return NextResponse.json({ previewUrl });
  } catch (e) {
    console.error('Spotify search error:', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
