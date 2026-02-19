export async function getAudioUrl(title: string, artist: string): Promise<string> {
  const tokenResponse = await fetch('/api/spotify-token');
  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok || !tokenData.token) {
    const errorMessage = tokenData.error || 'Could not authenticate with Spotify.';
    throw new Error(errorMessage);
  }
  const { token } = tokenData;

  const q = encodeURIComponent(`track:${title} artist:${artist}`);
  const searchResponse = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const searchData = await searchResponse.json();

  if (!searchResponse.ok) {
    throw new Error(searchData.error?.message || 'Failed to search Spotify.');
  }

  const previewUrl = searchData.tracks?.items?.[0]?.preview_url;
  if (!previewUrl) throw new Error('No preview available for this track');
  return previewUrl;
}
