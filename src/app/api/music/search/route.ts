import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://verome-api.deno.dev';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  const filter = request.nextUrl.searchParams.get('filter') || 'songs';
  
  if (!query) {
    return NextResponse.json({ error: 'q (query) is required' }, { status: 400 });
  }

  try {
    const apiUrl = `${BASE_URL}/api/search?q=${encodeURIComponent(query)}&filter=${filter}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch from verome API (${apiUrl}): ${response.status}`, errorText);
        throw new Error(`Failed to fetch from verome API: ${response.statusText}`);
    }
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Search proxy error:', error);
    return NextResponse.json({ error: 'Failed to search for music' }, { status: 500 });
  }
}
