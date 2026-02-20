'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Camera, FileText, BrainCircuit, BookCopy, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateStudyTools } from '@/lib/studyactions';
import type { SnapNotesOutput } from '@/ai/flows/snap-notes-flow';
import { Flashcard } from '@/components/flash-card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"


function SubmitButton({ action }: { action: 'summarize' | 'flashcards' | 'quiz' }) {
  const { pending } = useFormStatus();
  const Icon = action === 'summarize' ? FileText : action === 'flashcards' ? BookCopy : BrainCircuit;
  const text = action.charAt(0).toUpperCase() + action.slice(1);

  return (
    <Button type="submit" name="action" value={action} disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icon className="mr-2 h-4 w-4" />
      )}
      {pending ? 'Generating...' : `Generate ${text}`}
    </Button>
  );
}

function Quiz({ quiz }: { quiz: NonNullable<SnapNotesOutput['quiz']> }) {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const { toast } = useToast();

    const handleSubmit = () => {
        setSubmitted(true);
        const correctCount = quiz.reduce((count, question, index) => {
            return selectedAnswers[index] === question.answer ? count + 1 : count;
        }, 0);
        toast({
            title: "Quiz Results",
            description: `You scored ${correctCount} out of ${quiz.length}!`,
        });
    };

    return (
        <div className="space-y-6">
            {quiz.map((item, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>Question {index + 1}</CardTitle>
                        <CardDescription>{item.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            onValueChange={(value) => setSelectedAnswers(prev => ({ ...prev, [index]: value }))}
                            disabled={submitted}
                        >
                            {item.options.map((option, i) => {
                                const isCorrect = option === item.answer;
                                const isSelected = selectedAnswers[index] === option;
                                let stateColor = '';
                                if(submitted) {
                                    if(isCorrect) stateColor = 'text-green-600';
                                    else if(isSelected) stateColor = 'text-red-600';
                                }

                                return (
                                    <div key={i} className="flex items-center space-x-2">
                                        <RadioGroupItem value={option} id={`q${index}-o${i}`} />
                                        <Label htmlFor={`q${index}-o${i}`} className={stateColor}>{option}</Label>
                                    </div>
                                )
                            })}
                        </RadioGroup>
                    </CardContent>
                </Card>
            ))}
            <Button onClick={handleSubmit} disabled={submitted} className="w-full">Submit Quiz</Button>
        </div>
    );
}


export default function SnapNotesPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [state, formAction] = useFormState(generateStudyTools, { result: undefined, error: undefined });
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setVideoStream(stream);
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({ title: 'Camera Error', description: 'Could not access the camera. Please ensure permissions are granted.', variant: 'destructive' });
    }
  };

  const stopCamera = () => {
    videoStream?.getTracks().forEach(track => track.stop());
    setVideoStream(null);
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
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], "snapnote.jpg", { type: "image/jpeg" });
            setImagePreview(dataUrl);
            setImageFile(file);
          }
        }, 'image/jpeg');
      }
      stopCamera();
    }
  };
  
  const reset = () => {
      setImageFile(null);
      setImagePreview(null);
      stopCamera();
      // Reset form state if needed, but useFormState handles it
  }

  if (imageFile && imagePreview) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-0 relative">
            <Image src={imagePreview} alt="Notes preview" width={500} height={500} className="w-full h-auto object-contain rounded-t-lg" />
          </CardContent>
          <CardFooter className="p-4 flex-col items-stretch gap-4">
              <Button variant="outline" onClick={reset}>Choose a different image</Button>
              <form action={formAction} className="space-y-4">
                  <input type="hidden" name="photo" value={imageFile ? 'true' : ''} />
                  {imageFile && <input type="hidden" name="photo" value={imageFile as any} />}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <SubmitButton action="summarize" />
                      <SubmitButton action="flashcards" />
                      <SubmitButton action="quiz" />
                  </div>
              </form>
          </CardFooter>
        </Card>

        {state.error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}

        {state.result?.summary && (
            <Card>
                <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                <CardContent><p className="whitespace-pre-wrap">{state.result.summary}</p></CardContent>
            </Card>
        )}

        {state.result?.flashcards && (
            <Card>
                <CardHeader><CardTitle>Flashcards</CardTitle></CardHeader>
                <CardContent>
                    <Carousel className="w-full max-w-xs mx-auto">
                        <CarouselContent>
                            {state.result.flashcards.map((card, index) => (
                                <CarouselItem key={index}>
                                    <Flashcard front={card.front} back={card.back} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                    </Carousel>
                </CardContent>
            </Card>
        )}

        {state.result?.quiz && (
             <Quiz quiz={state.result.quiz} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">SnapNotes</h1>
            <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
                Turn your notes into smart study tools with AI.
            </p>
        </div>
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Get Started</CardTitle>
                <CardDescription>
                Upload a photo of your notes or use your camera.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {videoStream ? (
                     <div className='flex flex-col items-center gap-4'>
                        <div className='w-full rounded-lg overflow-hidden border'>
                            <video ref={videoRef} className="w-full h-auto" autoPlay playsInline muted />
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
                    <div className="space-y-4">
                         <Button className="w-full" asChild>
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" /> Upload Photo
                                <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </Button>
                        <Button variant="outline" className="w-full" onClick={startCamera}>
                            <Camera className="mr-2 h-4 w-4" /> Use Camera
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
