const BASE_URL = 'https://verome-api.deno.dev';

export interface Song {
  id: string;
  videoId?: string;
  title: string;
  artist: string;
  album?: string;
  thumbnail?: string;
  duration?: number;
  startTime?: number;
  endTime?: number;
}

export interface SearchResponse {
  items: Song[];
  continuation?: string;
}

// Helper to parse "Song • Artist • 3:11" into seconds
function extractDuration(subtitle?: string): number | undefined {
  if (!subtitle) return undefined;
  const parts = subtitle.split(' • ');
  const timeStr = parts[parts.length - 1]; // "3:11"
  if (!timeStr) return undefined;
  const [mins, secs] = timeStr.split(':').map(Number);
  if (!isNaN(mins) && !isNaN(secs)) {
    return mins * 60 + secs;
  }
  return undefined;
}


class MusicService {
  /**
   * Search for songs
   * @param query - Search term
   * @param filter - 'songs' | 'albums' | 'artists' (default: 'songs')
   */
  async searchSongs(query: string, filter: string = 'songs'): Promise<Song[]> {
    try {
      const response = await fetch(
        `/api/music/search?q=${encodeURIComponent(query)}&filter=${filter}`
      );
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API response to your app's Song interface
      return (data.results || [])
        .filter((item: any) => item.resultType === 'song' && item.videoId)
        .map((item: any) => ({
        id: item.videoId,
        videoId: item.videoId,
        title: item.title,
        artist: item.artists?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
        album: item.album?.name,
        thumbnail: item.thumbnails?.[0]?.url,
        duration: item.duration ?? extractDuration(item.subtitle),
      }));
    } catch (error) {
      console.error('Music search error:', error);
      return [];
    }
  }

  /**
   * Get streaming URL for a song
   */
  async getStreamUrl(videoId: string): Promise<string | null> {
    // Simply return the proxy endpoint URL – the actual audio will be fetched from our own domain
    return `/api/stream-proxy?videoId=${videoId}`;
  }

  /**
   * Get song details
   */
  async getSongDetails(videoId: string): Promise<Song | null> {
    try {
      const response = await fetch(`${BASE_URL}/api/songs/${videoId}`);
      const data = await response.json();
      
      return {
        id: videoId,
        videoId,
        title: data.title,
        artist: data.artists?.[0]?.name || 'Unknown',
        album: data.album?.name,
        thumbnail: data.thumbnail?.url,
        duration: data.duration
      };
    } catch (error) {
      console.error('Song details error:', error);
      return null;
    }
  }
}

export const musicService = new MusicService();
