
'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Play, Pause, Music } from 'lucide-react';
import { submissions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import type { Song } from '@/lib/musicService';
import { useToast } from '@/hooks/use-toast';
import { Howl } from 'howler';
import { getAudioUrl } from '@/lib/get-audio-url';

export default function VotePage() {
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [playingSong, setPlayingSong] = useState<string | null>(null);
  const audioRef = useRef<Howl | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleVote = (submissionId: string) => {
    setVoted(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  };

  const stopPlayback = () => {
    audioRef.current?.unload();
    if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
    }
    setPlayingSong(null);
  }

  const togglePreview = async (submissionId: string, song: Song) => {
    if (!song.title || !song.artist) return;

    if (playingSong === submissionId) {
        stopPlayback();
    } else {
        stopPlayback(); // Stop any currently playing song
        
        try {
            setPlayingSong(submissionId); // Optimistically set playing state
            const audioUrl = await getAudioUrl(song.title, song.artist);
            
            const sound = new Howl({
                src: [audioUrl],
                format: ['mp3'],
                html5: true,
                onplay: () => {
                    setPlayingSong(submissionId);
                },
                onpause: () => {
                    setPlayingSong(null);
                },
                onend: () => {
                    setPlayingSong(null);
                },
                onstop: () => {
                    setPlayingSong(null);
                },
                onloaderror: (id, error) => {
                    console.error('Howl load error:', error, '| URL:', audioUrl);
                    toast({ variant: 'destructive', title: 'Could not load audio.' });
                    setPlayingSong(null);
                },
                onplayerror: (id, error) => {
                    console.error('Howl play error:', error);
                    toast({ variant: 'destructive', title: 'Could not play preview.' });
                    setPlayingSong(null);
                }
            });

            audioRef.current = sound;
            
            const { startTime = 0, endTime } = song;

            sound.seek(startTime);
            sound.play();

            if (endTime) {
              const duration = (endTime - startTime) * 1000;
              if (duration > 0) {
                timeoutRef.current = setTimeout(() => {
                    sound.pause();
                }, duration);
              }
            }

        } catch (error) {
            console.error("Playback failed:", error);
            toast({ variant: 'destructive', title: 'No preview available for this track.' })
            setPlayingSong(null);
        }
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Vote on Submissions</h1>
        <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
          Help decide today's winner. Your votes are anonymous.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {submissions.map((submission) => {
          const image = PlaceHolderImages.find(p => p.id === submission.imageId);
          const isPlaying = playingSong === submission.id;

          return (
            <Card key={submission.id} className="overflow-hidden group">
              <CardContent className="p-0">
                <div className="aspect-[3/4] relative">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt="User submission"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                      data-ai-hint={image.imageHint}
                    />
                  )}
                  {submission.song && (
                    <div 
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                      onClick={() => togglePreview(submission.id, submission.song!)}
                    >
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        {isPlaying ? <Pause className="h-10 w-10 text-white" /> : <Play className="h-10 w-10 text-white" />}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4">
                    <Button
                      size="icon"
                      className={cn(
                          "rounded-full h-12 w-12 shadow-lg transition-all duration-300",
                          voted[submission.id] ? 'bg-accent text-accent-foreground scale-110' : 'bg-background/50 backdrop-blur-sm text-foreground hover:bg-background'
                      )}
                      onClick={() => handleVote(submission.id)}
                    >
                      <Heart className={cn("h-6 w-6", voted[submission.id] && "fill-current")} />
                    </Button>
                  </div>
                </div>
                {submission.song && (
                  <div className="p-3 flex items-center gap-3 border-t">
                      {submission.song.thumbnail && (
                          <Image
                              src={submission.song.thumbnail}
                              alt={submission.song.title}
                              width={40} height={40}
                              className="w-10 h-10 rounded object-cover"
                          />
                      )}
                      <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{submission.song.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                              {submission.song.artist}
                          </p>
                      </div>
                      {isPlaying && (
                          <div className="flex items-center gap-0.5 h-4">
                            <span className="w-1 h-full bg-primary animate-[wave_1.2s_ease-in-out_-0.4s_infinite_both]"></span>
                            <span className="w-1 h-2/3 bg-primary animate-[wave_1.2s_ease-in-out_-0.2s_infinite_both]"></span>
                            <span className="w-1 h-full bg-primary animate-[wave_1.2s_ease-in-out_0s_infinite_both]"></span>
                            <style>{`
                              @keyframes wave {
                                0%, 100% { transform: scaleY(0.5); }
                                50% { transform: scaleY(1); }
                              }
                            `}</style>
                          </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
