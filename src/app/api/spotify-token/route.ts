import { NextResponse } from 'next/server';

export async function GET() {
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
    return NextResponse.json({ error: 'Failed to fetch Spotify token' }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json({ token: data.access_token });
}
