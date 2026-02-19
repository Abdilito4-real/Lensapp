
'use client';

import { useState, useRef, type ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Camera, ArrowLeft, Send, Play, Pause } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { MusicSearch } from './music-search';
import type { Song } from '@/lib/musicService';
import { musicService } from '@/lib/musicService';

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
    if(timeoutRef.current) clearTimeout(timeoutRef.current);
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
        setIsPlaying(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } else {
      try {
        const streamUrl = await musicService.getStreamUrl(selectedSong.videoId);
        if (streamUrl) {
          if (!audioRef.current || audioRef.current.src !== streamUrl) {
            if (audioRef.current) audioRef.current.pause();
            audioRef.current = new Audio(streamUrl);
            audioRef.current.onpause = () => setIsPlaying(false);
            audioRef.current.onended = () => setIsPlaying(false);
          }
          
          const { startTime = 0, endTime } = selectedSong;
          audioRef.current.currentTime = startTime;
          audioRef.current.play();
          setIsPlaying(true);

          if (endTime) {
            const duration = (endTime - startTime) * 1000;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              audioRef.current?.pause();
              setIsPlaying(false);
            }, duration);
          }

        } else {
          toast({ variant: 'destructive', title: 'Could not play preview.' });
        }
      } catch (error) {
        console.error("Playback failed:", error);
        toast({ variant: 'destructive', title: 'Could not play preview.' });
      }
    }
  };

  useEffect(() => {
    return () => {
        audioRef.current?.pause();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
  }, [selectedSong]);


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit to "{challengeTopic}"</CardTitle>
        <CardDescription>
          {{
            select: 'Choose a photo from your library or use your camera.',
            preview: 'Review your photo and add a song before submitting.',
          }[stage]}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {stage === 'select' && (
          <div className="space-y-4">
            {isCameraOn ? (
              <div className='flex flex-col items-center gap-4'>
                <div className='w-full rounded-lg overflow-hidden border'>
                  <video ref={videoRef} className="w-full h-auto" />
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
        )}

        {stage === 'preview' && imagePreview && (
          <div className="space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border">
                <Image src={imagePreview} alt="Submission preview" fill className="object-cover" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Add a song (optional)</label>
                <MusicSearch 
                  onSelectSong={setSelectedSong} 
                  selectedSong={selectedSong}
                  isPlaying={isPlaying}
                  onTogglePlay={togglePlayback}
                />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetFlow} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={handleFinalSubmission} className="w-full">
                  <Send className="mr-2 h-4 w-4"/> Submit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
