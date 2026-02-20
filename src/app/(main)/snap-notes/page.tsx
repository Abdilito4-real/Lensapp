'use client';

import { useState, useRef, type ChangeEvent, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, Camera, FileText, BrainCircuit, BookCopy, Loader2, AlertCircle, X, Plus, SwitchCamera, RefreshCcw } from 'lucide-react';
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

    const handleRetake = () => {
        setSubmitted(false);
        setSelectedAnswers({});
        toast({
            title: "Quiz Reset",
            description: "You can now retake the quiz.",
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
                            value={selectedAnswers[index] || ''}
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
            {submitted ? (
                <Button onClick={handleRetake} className="w-full">
                    <RefreshCcw className="mr-2 h-4 w-4"/>
                    Retake Quiz
                </Button>
            ) : (
                <Button onClick={handleSubmit} className="w-full">Submit Quiz</Button>
            )}
        </div>
    );
}

const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject(new Error('Canvas is empty'));
                }
                const newFile = new File([blob], file.name, {
                    type: file.type,
                    lastModified: Date.now()
                });
                resolve(newFile);
            }, file.type, 0.9); // 0.9 quality
        };

        img.onerror = reject;
        reader.readAsDataURL(file);
    });
};


export default function SnapNotesPage() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const [state, formAction] = useActionState(generateStudyTools, { result: undefined, error: undefined });
  const { toast } = useToast();

  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (const file of Array.from(files)) {
          try {
            const resizedFile = await resizeImage(file, 1024, 1024);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
                setImageFiles(prev => [...prev, resizedFile]);
            };
            reader.readAsDataURL(resizedFile);
          } catch(error) {
            console.error("Image resize failed:", error);
            toast({ title: 'Image Error', description: `Could not process ${file.name}.`, variant: 'destructive' });
          }
      }
    }
  };

  const startCamera = async (mode: 'user' | 'environment') => {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      setVideoStream(stream);
    } catch (err) {
      console.error("Error accessing camera: ", err);
      toast({ title: 'Camera Error', description: 'Could not access the camera. Please ensure permissions are granted.', variant: 'destructive' });
      setVideoStream(null);
    }
  };

  const stopCamera = () => {
    videoStream?.getTracks().forEach(track => track.stop());
    setVideoStream(null);
  };
  
  const toggleFacingMode = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        if (facingMode === 'user') {
            context.save();
            context.scale(-1, 1);
            context.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight);
            context.restore();
        } else {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        }
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "snapnote.jpg", { type: "image/jpeg" });
            try {
                const resizedFile = await resizeImage(file, 1024, 1024);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result as string]);
                    setImageFiles(prev => [...prev, resizedFile]);
                };
                reader.readAsDataURL(resizedFile);
            } catch (err) {
                console.error("Failed to resize image", err);
                toast({ title: 'Image Error', description: 'Could not process the captured image.', variant: 'destructive' });
            }
          }
        }, 'image/jpeg');
      }
      stopCamera();
    }
  };
  
  const handleRemoveImage = (indexToRemove: number) => {
      setImagePreviews(previews => previews.filter((_, index) => index !== indexToRemove));
      setImageFiles(files => files.filter((_, index) => index !== indexToRemove));
  };
  
  const reset = () => {
      setImageFiles([]);
      setImagePreviews([]);
      stopCamera();
  }

  // Camera View
  if (videoStream) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Use Camera</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="w-full rounded-lg overflow-hidden border relative">
              <video
                ref={videoRef}
                className="w-full h-auto"
                autoPlay
                playsInline
                muted
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)' }}
              />
              <canvas ref={canvasRef} className="hidden" />
               <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleFacingMode}
                  className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 hover:text-white rounded-full"
                >
                  <SwitchCamera className="h-5 w-5" />
                </Button>
            </div>
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                onClick={stopCamera}
                className="w-full"
              >
                Cancel
              </Button>
              <Button onClick={takePicture} className="w-full">
                <Camera className="mr-2 h-4 w-4" /> Capture
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      {imageFiles.length > 0 ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Notes</CardTitle>
              <CardDescription>
                You've selected {imageFiles.length} image
                {imageFiles.length > 1 ? 's' : ''}. Add more or generate your
                study tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {imagePreviews.map((src, index) => (
                  <div key={src} className="relative group aspect-square">
                    <Image
                      src={src}
                      alt={`Note preview ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 33vw, 25vw"
                      className="rounded-lg object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => handleRemoveImage(index)}
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg text-muted-foreground hover:bg-muted hover:border-primary transition-colors"
                >
                  <Plus className="h-6 w-6 mb-1" />
                  <span className="text-sm">Add More</span>
                </button>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex-col items-stretch gap-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => startCamera(facingMode)}
                >
                  <Camera className="mr-2 h-4 w-4" /> Use Camera
                </Button>
                <Button variant="secondary" className="w-full" onClick={reset}>
                  Clear All
                </Button>
              </div>
              <form
                action={formData => {
                  if (imageFiles.length > 0) {
                    imageFiles.forEach(file => {
                      formData.append('photo', file);
                    });
                  }
                  formAction(formData);
                }}
                className="space-y-4"
              >
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
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{state.result.summary}</p>
              </CardContent>
            </Card>
          )}

          {state.result?.flashcards && (
            <Card>
              <CardHeader>
                <CardTitle>Flashcards</CardTitle>
              </CardHeader>
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

          {state.result?.quiz && <Quiz quiz={state.result.quiz} />}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              SnapNotes
            </h1>
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
              <div className="space-y-4">
                  <Button
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Upload Photos
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => startCamera(facingMode)}
                  >
                    <Camera className="mr-2 h-4 w-4" /> Use Camera
                  </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
