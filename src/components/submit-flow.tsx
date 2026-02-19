'use client';

import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Camera,
  ArrowLeft,
  Play,
  Pause,
  Music,
  Crop,
  SlidersHorizontal,
  Type,
  Smile,
  Undo,
  Redo,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { MusicSearch } from './music-search';
import type { Song } from '@/lib/musicService';
import { musicService } from '@/lib/musicService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type Stage = 'select' | 'preview';

export function SubmitFlow({ challengeTopic }: { challengeTopic: string }) {
  const [stage, setStage] = useState<Stage>('select');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [caption, setCaption] = useState('');
  const [isMusicSearchOpen, setIsMusicSearchOpen] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStage('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({ title: 'Camera Error', description: 'Could not access the camera.', variant: 'destructive' });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
    }
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            setImageFile(file);
          }
        }, 'image/jpeg');
        setStage('preview');
        stopCamera();
      }
    }
  };

  const resetFlow = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setImagePreview(null);
    setImageFile(null);
    setSelectedSong(null);
    setStage('select');
    stopCamera();
  };

  const handleFinalSubmission = () => {
    toast({
      title: 'Submission Successful!',
      description: selectedSong
        ? `Your photo with "${selectedSong.title}" has been submitted.`
        : 'Your photo has been entered into the challenge.'
    });
    router.push('/');
  }

  const togglePlayback = async () => {
    if (!selectedSong || !selectedSong.videoId) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
    } else {
      try {
        if (!audioRef.current || !audioRef.current.src.includes(selectedSong.videoId)) {
            const streamUrl = await musicService.getStreamUrl(selectedSong.videoId);
            if (streamUrl) {
                if (audioRef.current) audioRef.current.pause();
                audioRef.current = new Audio(streamUrl);
                const onEnd = () => {
                    setIsPlaying(false);
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                };
                audioRef.current.onpause = onEnd;
                audioRef.current.onended = onEnd;
            } else {
                toast({ variant: 'destructive', title: 'Could not play preview.' });
                return;
            }
        }
        
        const { startTime = 0, endTime } = selectedSong;
        audioRef.current.currentTime = startTime;
        await audioRef.current.play();
        setIsPlaying(true);

        if (endTime) {
            const duration = (endTime - startTime) * 1000;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
            audioRef.current?.pause();
            }, duration);
        }

      } catch (error) {
        console.error("Playback failed:", error);
        toast({ variant: 'destructive', title: 'Could not play preview.' });
      }
    }
  };

  const handleSongSelected = (song: Song | null) => {
    setSelectedSong(song);
    setIsMusicSearchOpen(false);
  }
  
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!selectedSong && audioRef.current) {
        audioRef.current.pause();
    }
  }, [selectedSong]);

  if (stage === 'preview' && imagePreview) {
    return (
      <>
        <div className="w-full max-w-md mx-auto">
          <header className="flex items-center justify-between py-2">
              <Button variant="ghost" size="icon" onClick={resetFlow}>
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Edit</h1>
              <div className="w-10"></div> {/* Spacer */}
          </header>

          <div className="flex items-center justify-center gap-1 sm:gap-2 p-2 overflow-x-auto border-y my-2">
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => setIsMusicSearchOpen(true)}><Music className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Crop feature coming soon!"})}><Crop className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Editing tools coming soon!"})}><SlidersHorizontal className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Text feature coming soon!"})}><Type className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Emoji feature coming soon!"})}><Smile className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Undo feature coming soon!"})}><Undo className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Redo feature coming soon!"})}><Redo className="h-5 w-5" /></Button>
          </div>

          <Card className="shadow-none border-none bg-transparent">
            <CardHeader>
              <CardTitle>Submit to "{challengeTopic}"</CardTitle>
              <CardDescription>
                  Review your photo and add details before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 !p-0">
              <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border">
                  <Image src={imagePreview} alt="Submission preview" fill className="object-cover" sizes="(max-width: 448px) 100vw, 448px" />
              </div>
              <div className="space-y-4 p-4">
                {selectedSong && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Selected song</label>
                        <Card className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                            {selectedSong.thumbnail && (
                                <Image
                                src={selectedSong.thumbnail}
                                alt={selectedSong.title}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded object-cover flex-shrink-0"
                                />
                            )}
                            <div className="min-w-0">
                                <p className="font-medium truncate">{selectedSong.title}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                {selectedSong.artist}
                                </p>
                            </div>
                            </div>
                            <div className="flex items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={togglePlayback}
                                    className="h-8 w-8 flex-shrink-0"
                                >
                                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedSong(null)}
                                    className="h-8 w-8 flex-shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Add caption (optional)</label>
                    <Textarea 
                      placeholder="Add caption..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" onClick={resetFlow} className="w-full">
                 Back
              </Button>
              <Button onClick={handleFinalSubmission} className="w-full">
                  Submit
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Dialog open={isMusicSearchOpen} onOpenChange={setIsMusicSearchOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add a song</DialogTitle>
                    <DialogDescription>
                        Search for a song and select a segment to add to your photo.
                    </DialogDescription>
                </DialogHeader>
                <MusicSearch onSelectSong={handleSongSelected} />
            </DialogContent>
        </Dialog>
      </>
    );
  }

  // Original 'select' stage
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit to "{challengeTopic}"</CardTitle>
        <CardDescription>
          Choose a photo from your library or use your camera.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {isCameraOn ? (
              <div className='flex flex-col items-center gap-4'>
                <div className='w-full rounded-lg overflow-hidden border'>
                  <video ref={videoRef} className="w-full h-auto" autoPlay playsInline />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex w-full gap-2">
                    <Button variant="outline" onClick={stopCamera} className="w-full">Cancel</Button>
                    <Button onClick={takePicture} className="w-full">
                      <Camera className="mr-2 h-4 w-4" /> Capture
                    </Button>
                </div>
              </div>
            ) : (
              <>
                <Button className="w-full" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                    <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </Button>
                <Button variant="outline" className="w-full" onClick={startCamera}>
                  <Camera className="mr-2 h-4 w-4" /> Use Camera
                </Button>
              </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
