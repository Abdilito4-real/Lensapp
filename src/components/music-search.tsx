'use client';

import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'debounce';
import axios from 'axios';
import type { Song } from '@/lib/definitions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Search, X, Play } from 'lucide-react';
import { LensLoader } from './lens-loader';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MusicSearchProps {
  onSelectSong: (song: Song | null) => void;
  selectedSong?: Song | null;
  className?: string;
}

export function MusicSearch({ onSelectSong, selectedSong, className = '' }: MusicSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const searchSongs = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `https://verome-api.deno.dev/api/search?q=${encodeURIComponent(searchQuery)}&filter=songs`
        );
        const data = response.data;
        const formattedSongs = data.map((item: any) => ({
          id: item.id,
          name: item.title,
          artist: item.artist,
          album: item.album,
          cover: item.thumbnail,
          previewUrl: item.preview_url,
        }));
        setResults(formattedSongs);
      } catch (error) {
        console.error('Search failed:', error);
        toast({
            variant: "destructive",
            title: "Music search failed",
            description: "Could not fetch song results. Please try again."
        })
      } finally {
        setLoading(false);
      }
    }, 300),
    [toast]
  );

  useEffect(() => {
    searchSongs(query);
    return () => {
      searchSongs.clear(); // Cleanup debounce
    };
  }, [query, searchSongs]);

  const handleSelectSong = (song: Song) => {
    onSelectSong(song);
    setIsOpen(false);
    setQuery(''); // Clear search after selection
  };

  return (
    <div className={cn('relative', className)}>
      {selectedSong ? (
        <Card className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {selectedSong.cover && (
              <Image 
                src={selectedSong.cover} 
                alt={selectedSong.name}
                width={40}
                height={40}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="font-medium truncate">{selectedSong.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {Array.isArray(selectedSong.artist) 
                  ? selectedSong.artist.join(', ') 
                  : selectedSong.artist}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSelectSong(null)}
            className="h-8 w-8 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 150)}
            placeholder="Add a song to your photo..."
            className="w-full pl-10"
          />

          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <LensLoader className="w-5 h-5" />
            </div>
          )}
        </div>
      )}

      {isOpen && query && !selectedSong && (
        <Card className="absolute z-10 w-full mt-1 shadow-lg max-h-60 overflow-y-auto p-0">
          {results.length > 0 ? (
            results.map((song) => (
              <button
                key={song.id}
                onClick={() => handleSelectSong(song)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors border-b last:border-b-0 text-left"
              >
                {song.cover && (
                  <Image 
                    src={song.cover} 
                    alt={song.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{song.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Array.isArray(song.artist) 
                      ? song.artist.join(', ') 
                      : song.artist}
                  </p>
                </div>
                {song.previewUrl && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      const audio = new Audio(song.previewUrl);
                      audio.play().catch(err => toast({ variant: 'destructive', title: 'Could not play preview.'}));
                    }}
                    className="h-8 w-8 flex-shrink-0"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </button>
            ))
          ) : (
            !loading && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No songs found.
              </div>
            )
          )}
        </Card>
      )}
    </div>
  );
}
