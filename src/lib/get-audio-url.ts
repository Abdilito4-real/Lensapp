export async function getAudioUrl(title: string, artist: string): Promise<string | null> {
  const tokenResponse = await fetch('/api/spotify-token');
  const tokenText = await tokenResponse.text();

  if (!tokenResponse.ok) {
    try {
      const errorJson = JSON.parse(tokenText);
      throw new Error(errorJson.error || 'Could not authenticate with Spotify.');
    } catch (e) {
      throw new Error(`Could not authenticate with Spotify. Server says: ${tokenText}`);
    }
  }

  const tokenData = JSON.parse(tokenText);

  if (!tokenData.token) {
    throw new Error(tokenData.error || 'Could not authenticate with Spotify: No token received.');
  }
  const { token } = tokenData;

  const q = encodeURIComponent(`track:${title} artist:${artist}`);
  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const searchBody = await searchResponse.text();
  if (!searchResponse.ok) {
    try {
      const searchError = JSON.parse(searchBody);
      throw new Error(searchError.error?.message || 'Failed to search Spotify.');
    } catch(e) {
      throw new Error(`Failed to search Spotify. Server says: ${searchBody}`);
    }
  }

  const searchData = JSON.parse(searchBody);

  const previewUrl = searchData.tracks?.items?.[0]?.preview_url;
  if (!previewUrl) return null;
  return previewUrl;
}
