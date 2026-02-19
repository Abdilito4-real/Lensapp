export async function getAudioUrl(title: string, artist: string): Promise<string> {
  const tokenRes = await fetch('/api/spotify-token');
  const tokenData = await tokenRes.json().catch(() => ({}));

  if (!tokenRes.ok) {
    throw new Error(tokenData.error || `Failed to get Spotify token: ${tokenRes.statusText}`);
  }

  const { token } = tokenData;
  if (!token) {
    throw new Error('Spotify token is missing from response.');
  }

  const q = encodeURIComponent(`track:${title} artist:${artist}`);
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('Spotify search failed:', res.status, data);
    throw new Error(`Spotify search failed: ${data.error?.message || res.statusText}`);
  }
  const previewUrl = data.tracks?.items?.[0]?.preview_url;
  if (!previewUrl) throw new Error('No preview available for this track');
  return previewUrl;
}
