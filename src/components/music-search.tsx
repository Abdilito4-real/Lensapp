
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import debounce from 'debounce';
import { musicService, type Song } from '@/lib/musicService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Search, Music, Play, Pause } from 'lucide-react';
import { LensLoader } from './lens-loader';
import { useToast } from '@/hooks/use-toast';

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

  const [previewingSongId, setPreviewingSongId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const stopPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (previewTimeoutRef.current) {
      clearTimeout(previewTimeoutRef.current);
    }
    setPreviewingSongId(null);
  }, []);

  useEffect(() => {
    searchSongs(query);
    fetchSuggestions(query);
    return () => {
      searchSongs.clear();
      fetchSuggestions.clear();
      stopPreview();
    };
  }, [query, searchSongs, fetchSuggestions, stopPreview]);

  const handleSelectSong = (song: Song) => {
    stopPreview();
    const startTime = 0;
    let endTime = 20;

    if (song.duration && song.duration > 0) {
      endTime = Math.min(song.duration, 20);
    }
    
    onSelectSong({
      ...song,
      startTime,
      endTime,
      duration: endTime - startTime,
    });
  };

  const handlePlayPreview = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    if (!song.videoId) return;

    if (previewingSongId === song.id) {
      stopPreview();
      return;
    }

    stopPreview(); // Stop any other preview

    try {
      setPreviewingSongId(song.id);
      const streamUrl = await musicService.getStreamUrl(song.videoId);

      if (streamUrl) {
        const audio = new Audio(streamUrl);
        previewAudioRef.current = audio;
        audio.volume = 0.5;
        
        const onEnd = () => {
          if (previewAudioRef.current === audio) {
            stopPreview();
          }
        };
        audio.addEventListener('ended', onEnd);
        audio.addEventListener('pause', onEnd);

        await audio.play();
        
        previewTimeoutRef.current = setTimeout(() => {
            onEnd();
        }, 7000); // 7-second preview

      } else {
        toast({ variant: 'destructive', title: 'Could not play preview.' });
        stopPreview();
      }
    } catch (error) {
      console.error('Preview failed:', error);
      toast({ variant: 'destructive', title: 'Could not play preview.' });
      stopPreview();
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
                  onClick={() => handleSelectSong(song)}
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
                      {previewingSongId === song.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
    </>
  );
}
