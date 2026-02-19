
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'debounce';
import { musicService, type Song } from '@/lib/musicService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Search, Music, Play } from 'lucide-react';
import { LensLoader } from './lens-loader';
import { useToast } from '@/hooks/use-toast';
import { AudioTrimmer } from './audio-trimmer';

interface MusicSearchProps {
  onSelectSong: (song: Song | null) => void;
  className?: string;
}

export function MusicSearch({
  onSelectSong,
  className = '',
}: MusicSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true); // Default to open in dialog
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [showTrimmer, setShowTrimmer] = useState(false);
  const [songToTrim, setSongToTrim] = useState<Song | null>(null);

  const searchSongs = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const songs = await musicService.searchSongs(searchQuery);
        setResults(songs);
      } catch (error) {
        console.error('Search failed:', error);
        toast({
          variant: 'destructive',
          title: 'Music search failed',
          description: 'Could not fetch song results. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    }, 400),
    [toast]
  );

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const sugg = await musicService.getSuggestions(searchQuery);
        setSuggestions(sugg);
      } catch (error) {
        console.error('Failed to get suggestions:', error);
      }
    }, 200),
    []
  );

  useEffect(() => {
    searchSongs(query);
    fetchSuggestions(query);
    return () => {
      searchSongs.clear();
      fetchSuggestions.clear();
    };
  }, [query, searchSongs, fetchSuggestions]);

  const handleOpenTrimmer = (song: Song) => {
    setSongToTrim(song);
    setShowTrimmer(true);
    setIsOpen(false);
  };
  
  const handleSegmentSelected = (startTime: number, endTime: number) => {
    if (songToTrim) {
      onSelectSong({
        ...songToTrim,
        startTime,
        endTime,
        duration: endTime - startTime
      });
    }
    setSongToTrim(null);
    setShowTrimmer(false);
  };

  const handlePlayPreview = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    if (!song.videoId) return;

    try {
      const streamUrl = await musicService.getStreamUrl(song.videoId);
      if (streamUrl) {
        const audio = new Audio(streamUrl);
        audio.volume = 0.5;
        audio.play().catch(err => toast({ variant: 'destructive', title: 'Could not play preview.' }));
        setTimeout(() => audio.pause(), 5000); // Preview for 5 seconds
      } else {
        toast({ variant: 'destructive', title: 'Could not play preview.' });
      }
    } catch (error) {
      console.error('Preview failed:', error);
      toast({ variant: 'destructive', title: 'Could not play preview.' });
    }
  };

  return (
    <>
      <div className={className} ref={dropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder="Search for a song..."
              className="w-full pl-10"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <LensLoader className="w-5 h-5" />
              </div>
            )}
          </div>
        
        {isOpen && query && (
          <Card className="z-10 w-full mt-2 shadow-lg max-h-60 overflow-y-auto p-0">
            {results.length > 0 ? (
              results.map((song) => (
                <button
                  key={song.id}
                  onClick={() => handleOpenTrimmer(song)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors border-b last:border-b-0 text-left"
                >
                  {song.thumbnail ? (
                    <Image
                      src={song.thumbnail}
                      alt={song.title}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Music className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {song.artist}
                    </p>
                  </div>
                  {song.videoId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handlePlayPreview(e, song)}
                      className="h-8 w-8 flex-shrink-0"
                      aria-label="Preview song"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                </button>
              ))
            ) : (
              !loading && suggestions.length > 0 ? (
                <div className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-muted rounded"
                    >
                      <span className="text-muted-foreground">{suggestion}</span>
                    </button>
                  ))}
                </div>
              ) : null
            )}
            {!loading && results.length === 0 && query.length > 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No songs found.
              </div>
            )}
          </Card>
        )}
      </div>

      {showTrimmer && songToTrim && (
        <AudioTrimmer
          songId={songToTrim.videoId!}
          songTitle={songToTrim.title}
          onSelectSegment={handleSegmentSelected}
          onClose={() => {
            setShowTrimmer(false);
            setSongToTrim(null);
          }}
        />
      )}
    </>
  );
}
