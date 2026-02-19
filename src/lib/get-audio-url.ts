export async function getAudioUrl(title: string, artist: string): Promise<string> {
  const { token } = await fetch('/api/spotify-token').then(r => r.json());

  if (!token) {
    throw new Error('Could not authenticate with Spotify');
  }

  const q = encodeURIComponent(`track:${title} artist:${artist}`);
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  const previewUrl = data.tracks?.items?.[0]?.preview_url;
  if (!previewUrl) throw new Error('No preview available for this track');
  return previewUrl;
}
