
'use client';

import { useState, useRef, useEffect } from 'react';
import { Howl } from 'howler';
import { Button } from './ui/button';
import { LensLoader } from './lens-loader';
import { Pause, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAudioUrl } from '@/lib/get-audio-url';

interface AudioTrimmerProps {
  songTitle: string;
  songArtist: string;
  onSelectSegment: (startTime: number, endTime: number) => void;
  onClose: () => void;
}

export function AudioTrimmer({
  songTitle,
  songArtist,
  onSelectSegment,
  onClose,
}: AudioTrimmerProps) {
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const soundRef = useRef<Howl | null>(null);
  const animationRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<'start' | 'end' | null>(null);

  // Load audio and generate waveform
  useEffect(() => {
    const loadAudio = async () => {
      setIsLoading(true);
      try {
        const audioUrl = await getAudioUrl(songTitle, songArtist);

        if (!audioUrl) {
            toast({
                variant: 'destructive',
                title: 'Audio Error',
                description: 'No audio preview is available for this song to create a clip.'
            });
            setIsLoading(false);
            onClose();
            return;
        }

        const sound = new Howl({
          src: [audioUrl],
          format: ['mp3'],
          html5: true,
          onload: () => {
            const soundDuration = sound.duration();
            setDuration(soundDuration);
            setEndTime(Math.min(20, soundDuration));
            setIsLoading(false);
            generateWaveform();
          },
          onloaderror: (id, error) => {
             console.error('Howl load error:', error, '| URL:', audioUrl);
             toast({ variant: 'destructive', title: 'Could not load audio.', description: 'The audio format might not be supported.' });
             setIsLoading(false);
          },
          onplay: () => {
            setIsPlaying(true);
            const animate = () => {
              const time = soundRef.current?.seek() as number;
              if (time >= endTime) {
                soundRef.current?.pause();
              } else if (soundRef.current?.playing()) {
                setCurrentTime(time);
                animationRef.current = requestAnimationFrame(animate);
              }
            };
            animate();
          },
          onpause: () => {
             setIsPlaying(false);
             if (animationRef.current) cancelAnimationFrame(animationRef.current);
          },
          onstop: () => {
            setIsPlaying(false);
            setCurrentTime(0);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
          },
          onend: () => {
             setIsPlaying(false);
             if (animationRef.current) cancelAnimationFrame(animationRef.current);
          }
        });

        soundRef.current = sound;
      } catch (error: any) {
        console.error('Failed to load audio:', error);
        toast({ 
            variant: 'destructive', 
            title: 'Audio Error',
            description: error.message || 'Could not load audio for trimming.'
        });
        setIsLoading(false);
        onClose();
      }
    };

    loadAudio();

    return () => {
      soundRef.current?.unload();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songTitle, songArtist]);

  const generateWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'hsl(var(--muted-foreground) / 0.5)';
    
    for (let i = 0; i < width / 4; i++) {
      const barHeight = Math.random() * height * 0.8 + height * 0.1;
      ctx.fillRect(i * 4, (height - barHeight) / 2, 2, barHeight);
    }
  };

  const handlePlaySegment = () => {
    const sound = soundRef.current;
    if (!sound) return;

    if (sound.playing()) {
      sound.pause();
    } else {
      sound.seek(startTime);
      sound.play();
    }
  };
  
  const handleMouseDown = (handle: 'start' | 'end') => (e: React.MouseEvent) => {
    setIsDragging(handle);
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !duration) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newTime = percentage * duration;

    const MIN_DURATION = 5;
    
    if (isDragging === 'start') {
      setStartTime(Math.max(0, Math.min(newTime, endTime - MIN_DURATION)));
    } else if (isDragging === 'end') {
      setEndTime(Math.min(duration, Math.max(newTime, startTime + MIN_DURATION)));
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleSave = () => {
    onSelectSegment(startTime, endTime);
    onClose();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in">
      <div 
        className="bg-card rounded-xl w-full max-w-md p-6 shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <h3 className="text-lg font-semibold text-card-foreground mb-1">
          Select Audio Clip
        </h3>
        <p className="text-muted-foreground text-sm mb-6 truncate">{songTitle}</p>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LensLoader className="w-8 h-8" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-4">
               <Button
                  size="icon"
                  className="rounded-full h-12 w-12 flex-shrink-0"
                  onClick={handlePlaySegment}
                  disabled={isLoading}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <div ref={containerRef} className="relative h-16 w-full cursor-pointer" >
                  <canvas ref={canvasRef} width={400} height={64} className="w-full h-full rounded-lg" />
                  
                  <div 
                    className="absolute top-0 bottom-0 bg-primary/25 border-x-2 border-primary"
                    style={{
                      left: `${(startTime / duration) * 100}%`,
                      right: `${100 - (endTime / duration) * 100}%`
                    }}
                  >
                    <div 
                      className="absolute -left-1.5 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center"
                      onMouseDown={handleMouseDown('start')}
                    >
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                    </div>
                    
                    <div 
                      className="absolute -right-1.5 top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center"
                      onMouseDown={handleMouseDown('end')}
                    >
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                    </div>
                  </div>
                  
                  {soundRef.current && (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-accent"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                  )}
                </div>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground mb-6">
              <span>{formatTime(startTime)}</span>
              <span>Selected: {formatTime(endTime - startTime)}</span>
              <span>{formatTime(endTime)}</span>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="w-full">Cancel</Button>
              <Button onClick={handleSave} className="w-full">Use Segment</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
