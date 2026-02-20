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
    `${clientId}:${clientSecret}`
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
    const errorText = await res.text();
    console.error('Spotify Token Error:', errorText);
    try {
      // Try to parse it as JSON to get a structured error message
      const errorJson = JSON.parse(errorText);
      return NextResponse.json({ error: `Failed to fetch Spotify token: ${errorJson.error_description || 'Check server logs'}` }, { status: res.status });
    } catch (e) {
      // If it's not JSON, return the raw text
      return NextResponse.json({ error: `Failed to fetch Spotify token: ${errorText}` }, { status: res.status });
    }
  }

  const data = await res.json();
  return NextResponse.json({ token: data.access_token });
}
