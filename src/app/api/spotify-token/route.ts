import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Spotify credentials are not set.' },
        { status: 500 }
      );
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
      let errorDetails = 'Failed to fetch token';
      try {
        const errorData = await res.json();
        errorDetails = errorData.error_description || errorData.error || errorDetails;
      } catch (e) {
        errorDetails = await res.text();
      }
      return NextResponse.json({ error: errorDetails }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ token: data.access_token });
  } catch (error: any) {
    console.error('Spotify Token API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
