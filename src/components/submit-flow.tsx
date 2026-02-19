
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
  RotateCcw,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { MusicSearch } from './music-search';
import type { Song } from '@/lib/musicService';
import { musicService } from '@/lib/musicService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ImageCropper } from './image-cropper';

type Stage = 'select' | 'preview';

const initialFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
};

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

  const [filters, setFilters] = useState(initialFilters);
  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

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
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setSelectedSong(null);
    setFilters(initialFilters);
    setStage('select');
    stopCamera();
    setIsCropping(false);
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
  
  const handleResetFilters = () => {
    setFilters(initialFilters);
  };
  
  const handleCropComplete = async (croppedImageSrc: string) => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImagePreview(croppedImageSrc);
    
    try {
        const response = await fetch(croppedImageSrc);
        const blob = await response.blob();
        const newFile = new File([blob], imageFile?.name || 'cropped.jpg', {
            type: blob.type,
        });
        setImageFile(newFile);
    } catch (error) {
        console.error("Could not convert blob to file:", error);
        toast({
            variant: 'destructive',
            title: 'Failed to apply crop.',
            description: 'There was an issue processing the cropped image.',
        });
    }
    
    setIsCropping(false);
};

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    }
  }, [imagePreview]);

  useEffect(() => {
    if (!selectedSong && audioRef.current) {
        audioRef.current.pause();
    }
  }, [selectedSong]);

  if (stage === 'preview' && imagePreview) {
    return (
      <>
        <div className="w-full max-w-md mx-auto flex flex-col h-full" style={{minHeight: 'calc(100vh - 10rem)'}}>
          <header className="flex items-center justify-between py-2 flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={resetFlow}>
                  <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Edit</h1>
              <div className="w-10"></div> {/* Spacer */}
          </header>

          <div className="flex items-center justify-center gap-1 sm:gap-2 p-2 overflow-x-auto border-y my-2 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => setIsMusicSearchOpen(true)}><Music className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => setIsCropping(true)}><Crop className="h-5 w-5" /></Button>
              
              <Popover open={isEditPopoverOpen} onOpenChange={setIsEditPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-auto p-2">
                        <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-medium leading-none">Edit Filters</h4>
                                <p className="text-sm text-muted-foreground">
                                    Adjust your photo's look.
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleResetFilters} className="h-8 w-8 flex-shrink-0">
                                <RotateCcw className="h-4 w-4" />
                                <span className="sr-only">Reset filters</span>
                            </Button>
                        </div>
                        <div className="grid gap-2">
                             <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="brightness" className="col-span-2">Brightness</Label>
                                <Slider
                                    id="brightness"
                                    value={[filters.brightness]}
                                    max={200}
                                    step={1}
                                    onValueChange={(value) => setFilters(f => ({ ...f, brightness: value[0] }))}
                                    className="col-span-3"
                                />
                                <span className="text-sm text-muted-foreground font-mono justify-self-end">{filters.brightness}%</span>
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="contrast" className="col-span-2">Contrast</Label>
                                <Slider
                                    id="contrast"
                                    value={[filters.contrast]}
                                    max={200}
                                    step={1}
                                    onValueChange={(value) => setFilters(f => ({ ...f, contrast: value[0] }))}
                                    className="col-span-3"
                                />
                                <span className="text-sm text-muted-foreground font-mono justify-self-end">{filters.contrast}%</span>
                            </div>
                            <div className="grid grid-cols-6 items-center gap-4">
                                <Label htmlFor="saturate" className="col-span-2">Saturation</Label>
                                <Slider
                                    id="saturate"
                                    value={[filters.saturate]}
                                    max={200}
                                    step={1}
                                    onValueChange={(value) => setFilters(f => ({ ...f, saturate: value[0] }))}
                                    className="col-span-3"
                                />
                                <span className="text-sm text-muted-foreground font-mono justify-self-end">{filters.saturate}%</span>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
              </Popover>
              
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Text feature coming soon!"})}><Type className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Emoji feature coming soon!"})}><Smile className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Undo feature coming soon!"})}><Undo className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => toast({ title: "Redo feature coming soon!"})}><Redo className="h-5 w-5" /></Button>
          </div>

          <div className="relative flex-1 w-full rounded-lg overflow-hidden bg-black mb-4">
              <Image 
                src={imagePreview} 
                alt="Submission preview" 
                fill 
                className="object-contain" 
                sizes="(max-width: 448px) 100vw, 448px" 
                style={{
                  filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`
                }}
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 bg-gradient-to-t from-black/60 to-transparent">
                {selectedSong && (
                    <Card className="p-3 flex items-center justify-between bg-black/50 border-white/20 text-white">
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
                            <p className="text-sm text-white/70 truncate">
                            {selectedSong.artist}
                            </p>
                        </div>
                        </div>
                        <div className="flex items-center">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePlayback}
                                className="h-8 w-8 flex-shrink-0 text-white hover:bg-white/10 hover:text-white"
                            >
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedSong(null)}
                                className="h-8 w-8 flex-shrink-0 text-white hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                )}
                <Textarea 
                  placeholder="Add caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="bg-black/50 border-none text-white placeholder:text-gray-300 focus-visible:ring-0 text-center resize-none"
                  rows={1}
                />
              </div>
          </div>
          
          <div className="flex-shrink-0">
              <Button onClick={handleFinalSubmission} className="w-full">
                  Submit
              </Button>
          </div>
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

        {isCropping && imagePreview && (
            <ImageCropper 
                imageSrc={imagePreview}
                onClose={() => setIsCropping(false)}
                onCropComplete={handleCropComplete}
            />
        )}
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

    