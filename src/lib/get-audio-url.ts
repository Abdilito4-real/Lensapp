export async function getAudioUrl(videoId: string): Promise<string | null> {
  if (!videoId) return null;

  try {
    const response = await fetch(`/api/music/play/${videoId}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: 'Failed to parse error from music service', 
          details: 'Received an invalid response.' 
        }));
        // Construct a more detailed error message
        const errorMessage = `${errorData.error} Details: ${errorData.details || 'N/A'}`;
        throw new Error(errorMessage);
    }
    const data = await response.json();
    return data.url;
  } catch (error: any) {
    console.error(`Failed to get audio URL for ${videoId}:`, error);
    // rethrow to be caught by callers
    throw error;
  }
}
