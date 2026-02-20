import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://verome-api.deno.dev';

export async function GET(
    request: NextRequest,
    { params }: { params: { videoId: string } }
) {
    const videoId = params.videoId;
    console.log(`[PROXY] Received request for videoId: ${videoId}`);

    if (!videoId) {
        console.error('[PROXY] videoId is missing.');
        return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    try {
        const apiUrl = `${BASE_URL}/play/${videoId}`;
        console.log(`[PROXY] Fetching from external API: ${apiUrl}`);
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorText = await response.text();
            // This is the most important log for debugging
            console.error(`[PROXY] External API Error. Status: ${response.status}, URL: ${apiUrl}, Response: "${errorText}"`);
            
            // We'll return a more structured error to the client
            return NextResponse.json({ 
                error: 'Error from music service.',
                details: errorText 
            }, { status: response.status });
        }
        
        const data = await response.json();
        console.log(`[PROXY] Successfully fetched from external API for videoId: ${videoId}`);
        
        if (data.url) {
            return NextResponse.json({ url: data.url });
        } else {
            console.error(`[PROXY] No playable URL found in response for videoId: ${videoId}`, data);
            return NextResponse.json({ error: 'No playable URL found in response' }, { status: 404 });
        }

    } catch (error) {
        console.error('[PROXY] An unexpected error occurred in the proxy route:', error);
        return NextResponse.json({ error: 'An internal server error occurred while fetching music.' }, { status: 500 });
    }
}
