import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Spotify credentials are not set in .env file.');
    return NextResponse.json(
      { error: 'Spotify credentials are not set. Please add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to your .env file.' },
      { status: 500 }
    );
  }

  const creds = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

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
    console.error('Spotify Token Error:', error);
    return NextResponse.json({ error: `Failed to fetch Spotify token: ${error.error_description || 'Check server logs'}` }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ token: data.access_token });
}
