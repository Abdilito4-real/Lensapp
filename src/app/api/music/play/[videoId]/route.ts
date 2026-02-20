import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://verome-api.deno.dev';

export async function GET(
    request: NextRequest,
    { params }: { params: { videoId: string } }
) {
    const videoId = params.videoId;

    if (!videoId) {
        return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    try {
        const apiUrl = `${BASE_URL}/api/play/${videoId}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch from verome API (${apiUrl}): ${response.status}`, errorText);
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json({ error: errorJson.error || `Failed to fetch from verome API` }, { status: response.status });
            } catch (e) {
                return NextResponse.json({ error: errorText }, { status: response.status });
            }
        }
        const data = await response.json();
        
        if (data.url) {
            return NextResponse.json({ url: data.url });
        } else {
            return NextResponse.json({ error: 'No playable URL found in response' }, { status: 404 });
        }

    } catch (error) {
        console.error('Play proxy error:', error);
        return NextResponse.json({ error: 'Failed to get playable URL' }, { status: 500 });
    }
}
