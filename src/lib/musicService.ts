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
        id: item.videoId || item.id,
        videoId: item.videoId,
        title: item.title,
        artist: item.artists?.[0]?.name || item.artist || 'Unknown Artist',
        album: item.album?.name || item.album,
        thumbnail: item.thumbnails?.[0]?.url,
        duration: item.duration,
      }));
    } catch (error) {
      console.error('Music search error:', error);
      return [];
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getSuggestions(query: string): Promise<string[]> {
    try {
      const response = await fetch(
        `${BASE_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }

  /**
   * Get streaming URL for a song
   */
  async getStreamUrl(videoId: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/music/stream?videoId=${videoId}`);
      const data = await response.json();
      return data.url || null;
    } catch (error) {
      console.error('Stream URL error:', error);
      return null;
    }
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
