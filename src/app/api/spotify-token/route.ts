import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Spotify credentials are not set in environment variables.');
    return NextResponse.json(
      { error: 'Spotify credentials are not set. Please check your environment variables.' },
      { status: 500 }
    );
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Spotify token fetch failed:', res.status, data);
      return NextResponse.json(
        { error: `Failed to fetch Spotify token: ${data.error_description || res.statusText}` },
        { status: res.status }
      );
    }
    return NextResponse.json({ token: data.access_token });
  } catch (error) {
    console.error('Error in spotify-token route:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching Spotify token.' },
      { status: 500 }
    );
  }
}
