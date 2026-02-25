export async function getAudioUrl(title: string, artist: string): Promise<string> {
  // First try Spotify
  try {
    const tokenResponse = await fetch('/api/spotify-token');

    if (tokenResponse.ok) {
      const contentType = tokenResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const tokenData = await tokenResponse.json();
        const { token } = tokenData;

        if (token) {
          const q = encodeURIComponent(`track:${title} artist:${artist}`);
          const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (searchResponse.ok) {
            const searchContentType = searchResponse.headers.get('content-type');
            if (searchContentType && searchContentType.includes('application/json')) {
              const searchData = await searchResponse.json();
              const previewUrl = searchData.tracks?.items?.[0]?.preview_url;
              if (previewUrl) return previewUrl;
            }
          } else {
            console.warn(`Spotify search failed with status: ${searchResponse.status}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Spotify preview fetch failed:', error);
  }

  // Fallback to iTunes Search API (no auth required, more reliable previews)
  try {
    const itunesQuery = encodeURIComponent(`${title} ${artist}`);
    const itunesResponse = await fetch(
      `https://itunes.apple.com/search?term=${itunesQuery}&limit=1&media=music&entity=song`
    );

    if (itunesResponse.ok) {
      const itunesData = await itunesResponse.json();
      const previewUrl = itunesData.results?.[0]?.previewUrl;
      if (previewUrl) return previewUrl;
    }
  } catch (error) {
    console.error('iTunes preview fetch failed:', error);
  }

  throw new Error('No preview available for this track');
}
