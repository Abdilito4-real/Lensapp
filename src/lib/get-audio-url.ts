export async function getAudioUrl(title: string, artist: string): Promise<string> {
  const params = new URLSearchParams({
    title,
    artist,
  });

  const res = await fetch(`/api/spotify-search?${params.toString()}`);

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to fetch audio URL');
  }

  const { previewUrl } = await res.json();

  if (!previewUrl) {
    throw new Error('No preview available for this track');
  }

  return previewUrl;
}
