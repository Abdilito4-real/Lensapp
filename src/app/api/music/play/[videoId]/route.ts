
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
        const apiUrl = `${BASE_URL}/stream/${videoId}`;
        console.log(`[PROXY] Fetching from external API: ${apiUrl}`);

        // Fetch without automatically following redirects
        const response = await fetch(apiUrl, { redirect: 'manual' });

        // If it's a redirect (status 3xx), we've found our URL in the 'location' header
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location');
            if (location) {
                console.log(`[PROXY] Successfully retrieved stream URL for videoId: ${videoId}`);
                return NextResponse.json({ url: location });
            } else {
                console.error(`[PROXY] Redirect response missing 'location' header for videoId: ${videoId}`);
                return NextResponse.json({ error: 'Could not find audio stream URL in response.' }, { status: 500 });
            }
        }
        
        // If the response is not a redirect but is not OK, it's an error.
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[PROXY] External API Error. Status: ${response.status}, URL: ${apiUrl}, Response: "${errorText}"`);
            
            let errorJson = { error: 'Error from music service.', details: errorText };
             try {
                // The error from verome-api might be JSON
                const parsedError = JSON.parse(errorText);
                errorJson.details = parsedError;
            } catch (e) {
                // It wasn't JSON, so we just use the raw text
            }

            return NextResponse.json(errorJson, { status: response.status });
        }

        // Fallback for an unexpected OK response that isn't a redirect.
        // This case should ideally not happen based on the API's behavior.
        console.error(`[PROXY] Unexpected response from external API. Expected redirect, but got status: ${response.status}`);
        return NextResponse.json({ error: 'Unexpected response from music service.' }, { status: 500 });

    } catch (error) {
        console.error('[PROXY] An unexpected error occurred in the proxy route:', error);
        return NextResponse.json({ error: 'An internal server error occurred while fetching music.' }, { status: 500 });
    }
}
