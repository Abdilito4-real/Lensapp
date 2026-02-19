
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
import { Howl } from 'howler';

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [previewingSongId, setPreviewingSongId] = useState<string | null>(null);
  const previewAudioRef = useRef<Howl | null>(null);

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

  const stopPreview = useCallback(() => {
    previewAudioRef.current?.stop();
    previewAudioRef.current?.unload();
    previewAudioRef.current = null;
    setPreviewingSongId(null);
  }, []);

  useEffect(() => {
    searchSongs(query);
    return () => {
      searchSongs.clear();
      stopPreview();
    };
  }, [query, searchSongs, stopPreview]);

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

    setPreviewingSongId(song.id);

    try {
      const streamUrl = await musicService.getStreamUrl(song.videoId);
      if (!streamUrl) throw new Error('No stream URL');

      const sound = new Howl({
        src: [streamUrl],
        format: ['mp3', 'aac', 'm4a'], // Allow common formats
        html5: true, // Use HTML5 Audio to avoid WebAudio CORS issues
        volume: 0.5,
        onplay: () => {
             // Stop after 7 seconds
            setTimeout(() => sound.stop(), 7000);
        },
        onend: () => {
            if (previewAudioRef.current === sound) {
              stopPreview();
            }
        },
        onplayerror: (id, error) => {
          console.error('Howl play error:', error);
          toast({ variant: 'destructive', title: 'Could not play preview.' });
          if (previewAudioRef.current === sound) {
            stopPreview();
          }
        },
        onloaderror: (id, error) => {
            const messages: Record<number, string> = {
                1: 'MEDIA_ERR_ABORTED',
                2: 'MEDIA_ERR_NETWORK',
                3: 'MEDIA_ERR_DECODE',
                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
            };
            console.error('Howl load error:', messages[error as number] ?? error, '| URL:', streamUrl);
            toast({ variant: 'destructive', title: 'Could not play preview.'});
            if (previewAudioRef.current === sound) {
                stopPreview();
            }
        }
      });
      previewAudioRef.current = sound;
      sound.play();
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
                <div
                  key={song.id}
                  onClick={() => handleSelectSong(song)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleSelectSong(song);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors border-b last:border-b-0 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
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
                </div>
              ))
            ) : null }
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
