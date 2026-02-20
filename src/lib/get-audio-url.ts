export async function getAudioUrl(videoId: string): Promise<string | null> {
  if (!videoId) return null;

  try {
    const response = await fetch(`/api/music/play/${videoId}`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get audio stream.');
    }
    const data = await response.json();
    return data.url;
  } catch (error: any) {
    console.error(`Failed to get audio URL for ${videoId}:`, error);
    // rethrow to be caught by callers
    throw error;
  }
}
