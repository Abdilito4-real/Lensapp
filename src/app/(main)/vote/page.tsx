
'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Play, Pause } from 'lucide-react';
import { submissions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import type { Song } from '@/lib/musicService';
import { musicService } from '@/lib/musicService';
import { useToast } from '@/hooks/use-toast';

export default function VotePage() {
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [playingSong, setPlayingSong] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const handleVote = (submissionId: string) => {
    setVoted(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  };

  const togglePreview = async (submissionId: string, song: Song) => {
    if (!song.videoId) return;

    if (playingSong === submissionId) {
      audioRef.current?.pause();
      setPlayingSong(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      try {
        const streamUrl = await musicService.getStreamUrl(song.videoId);
        if (streamUrl) {
            audioRef.current = new Audio(streamUrl);
            const { startTime = 0, endTime } = song;

            audioRef.current.currentTime = startTime;
            audioRef.current.play();
            setPlayingSong(submissionId);
            
            const onEnded = () => {
                setPlayingSong(null);
            };

            audioRef.current.addEventListener('ended', onEnded);
            audioRef.current.addEventListener('pause', onEnded);

            if (endTime) {
              const duration = (endTime - startTime) * 1000;
              timeoutRef.current = setTimeout(() => {
                audioRef.current?.pause();
              }, duration);
            }
        } else {
            toast({ variant: 'destructive', title: 'Could not play preview.'})
        }
      } catch (error) {
        console.error("Playback failed:", error);
        toast({ variant: 'destructive', title: 'Could not play preview.'})
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
          return (
            <Card key={submission.id} className="overflow-hidden group">
              <CardContent className="p-0">
                <div className="aspect-[3/4] relative">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt="User submission"
                      fill
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={image.imageHint}
                    />
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
                      {submission.song.videoId && (
                          <Button
                              variant="ghost" size="icon"
                              onClick={() => togglePreview(submission.id, submission.song!)}
                              className="h-8 w-8 flex-shrink-0"
                          >
                            {playingSong === submission.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
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
