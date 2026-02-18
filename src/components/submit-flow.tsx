'use client';

import { useState, useRef, type ChangeEvent, useActionState, useEffect } from 'react';
import { moderatePhoto } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Camera, CheckCircle, XCircle, Loader2, ArrowLeft, Send } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Stage = 'select' | 'preview' | 'moderating' | 'result';

type ModerationState = {
  alignsWithTopic?: boolean;
  reason?: string;
  error?: string;
};

export function SubmitFlow({ challengeTopic }: { challengeTopic: string }) {
  const [stage, setStage] = useState<Stage>('select');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [moderationState, formAction] = useActionState<ModerationState, FormData>(moderatePhoto, {});
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (stage === 'moderating') {
      setStage('result');
    }
  }, [moderationState, stage]);

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

  const handleFormSubmit = (formData: FormData) => {
    setStage('moderating');
    formData.set('topic', challengeTopic);
    if(imageFile) {
      formData.set('photo', imageFile);
    }
    formAction(formData);
  };

  const resetFlow = () => {
    setImagePreview(null);
    setImageFile(null);
    setStage('select');
    stopCamera();
  };
  
  const handleFinalSubmission = () => {
    // In a real app, this would upload the file to Firebase Storage
    // and create a document in Firestore.
    toast({ title: 'Submission Successful!', description: 'Your photo has been entered into the challenge.' });
    router.push('/');
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Submit to "{challengeTopic}"</CardTitle>
        <CardDescription>
          {
            {
              select: 'Choose a photo from your library or use your camera.',
              preview: 'Review your photo before submitting for analysis.',
              moderating: 'Our AI is analyzing your photo...',
              result: 'Here is the result of the AI analysis.'
            }[stage]
          }
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

        {(stage === 'preview' || stage === 'moderating') && imagePreview && (
          <form action={handleFormSubmit} className="space-y-4">
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border">
              <Image src={imagePreview} alt="Submission preview" layout="fill" objectFit="cover" />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetFlow} disabled={stage === 'moderating'} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="submit" disabled={stage === 'moderating'} className="w-full">
                {stage === 'moderating' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                  </>
                ) : (
                  'Analyze Photo'
                )}
              </Button>
            </div>
          </form>
        )}
        
        {stage === 'result' && (
          <div className="space-y-4">
             {imagePreview && <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden border">
              <Image src={imagePreview} alt="Submission preview" layout="fill" objectFit="cover" />
            </div>}
            {moderationState.error && (
                 <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{moderationState.error}</AlertDescription>
                </Alert>
            )}
            {typeof moderationState.alignsWithTopic !== 'undefined' && (
                <Alert variant={moderationState.alignsWithTopic ? 'default' : 'destructive'}>
                    {moderationState.alignsWithTopic ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertTitle>{moderationState.alignsWithTopic ? "Looks Good!" : "Doesn't Seem to Match"}</AlertTitle>
                    <AlertDescription>{moderationState.reason}</AlertDescription>
                </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetFlow} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Try Again
              </Button>
              {moderationState.alignsWithTopic && (
                <Button onClick={handleFinalSubmission} className="w-full">
                    <Send className="mr-2 h-4 w-4"/> Submit
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
