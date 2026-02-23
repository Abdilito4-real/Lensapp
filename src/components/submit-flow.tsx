'use client';

import { useState, useRef, type ChangeEvent, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Camera,
  ArrowLeft,
  Crop,
  SlidersHorizontal,
  Type,
  Smile,
  Undo,
  Redo,
  X,
  RotateCcw,
  Trash2,
  SwitchCamera,
  RefreshCcw,
  Wand2,
  Loader2,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ImageCropper } from './image-cropper';
import Draggable from 'react-draggable';
import { Input } from '@/components/ui/input';
import { suggestCaption } from '@/lib/caption-actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

type Stage = 'select' | 'preview';

type TextElement = {
  id: number;
  content: string;
  position: { x: number; y: number };
  color: string;
  fontFamily: string;
  fontSize: number;
};

type EmojiElement = {
  id: number;
  content: string;
  position: { x: number; y: number };
  size: number;
};

const initialFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  hueRotate: 0,
  blur: 0,
};

type EditorState = {
  filters: typeof initialFilters;
  texts: TextElement[];
  emojis: EmojiElement[];
};

const fonts = [
    { name: 'Inter', family: 'sans-serif', className: 'font-body' },
    { name: 'Lobster', family: 'cursive', className: 'font-lobster' },
    { name: 'Anton', family: 'sans-serif', className: 'font-anton' },
    { name: 'Merriweather', family: 'serif', className: 'font-merriweather' },
];

const textColors = [ '#FFFFFF', '#000000', '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#14B8A6', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899' ];

const emojiList = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '👏', '🙌', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💥', '💫', '💦', '💨'];

const DraggableText = ({
  text,
  onTextUpdate,
  onDragStop,
  onClick,
  isActive,
}: {
  text: TextElement;
  onTextUpdate: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDragStop: (e: any, data: { x: number; y: number }) => void;
  onClick: (e: React.MouseEvent) => void;
  isActive: boolean;
}) => {
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      position={text.position}
      onStop={onDragStop}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className={cn(
          "absolute cursor-move p-2 rounded-lg",
          isActive && "ring-2 ring-primary ring-offset-2 ring-offset-black/50"
        )}
        onClick={onClick}
      >
        <Textarea
          value={text.content}
          onChange={onTextUpdate}
          className="bg-transparent border-none focus-visible:ring-2 focus-visible:ring-primary resize-none text-center font-bold p-0"
          style={{
            color: text.color,
            fontFamily: text.fontFamily,
            fontSize: `${text.fontSize}px`,
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
          }}
          rows={1}
        />
      </div>
    </Draggable>
  );
};

const DraggableEmoji = ({
  emoji,
  onDragStop,
  onClick,
  isActive,
}: {
  emoji: EmojiElement;
  onDragStop: (e: any, data: { x: number; y: number }) => void;
  onClick: (e: React.MouseEvent) => void;
  isActive: boolean;
}) => {
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      position={emoji.position}
      onStop={onDragStop}
      bounds="parent"
    >
      <div
        ref={nodeRef}
        className={cn(
            "absolute cursor-move p-2 rounded-full",
            isActive && "ring-2 ring-primary ring-offset-2 ring-offset-black/50"
        )}
        style={{
          fontSize: `${emoji.size}px`,
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        }}
        onClick={onClick}
      >
        {emoji.content}
      </div>
    </Draggable>
  );
};

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


export function SubmitFlow({ challengeTopic, challengeDescription }: { challengeTopic: string; challengeDescription: string; }) {
  const [stage, setStage] = useState<Stage>('select');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const isMountedRef = useRef(true);
  const [caption, setCaption] = useState('');
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);

  const [filters, setFilters] = useState(initialFilters);
  const [editPanel, setEditPanel] = useState<'filters' | 'text' | 'emoji' | null>(null);
  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const [texts, setTexts] = useState<TextElement[]>([]);
  const [emojis, setEmojis] = useState<EmojiElement[]>([]);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);
  const [activeEmojiId, setActiveEmojiId] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const [isDiscardWarningOpen, setIsDiscardWarningOpen] = useState(false);

  useEffect(() => {
    if (videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const recordHistory = (newState: EditorState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const handleUndo = () => {
    if (historyIndex <= 0) return;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const prevState = history[newIndex];
    if (prevState) {
      setFilters(prevState.filters);
      setTexts(prevState.texts);
      setEmojis(prevState.emojis);
    }
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const nextState = history[newIndex];
    if (nextState) {
      setFilters(nextState.filters);
      setTexts(nextState.texts);
      setEmojis(nextState.emojis);
    }
  };

  const enterPreviewStage = (imageUrl: string, file: File) => {
    setImagePreview(imageUrl);
    setImageFile(file);
    setStage('preview');
    
    // Reset and initialize history
    const initialState: EditorState = { filters: initialFilters, texts: [], emojis: [] };
    setHistory([initialState]);
    setHistoryIndex(0);
    setFilters(initialState.filters);
    setTexts(initialState.texts);
    setEmojis(initialState.emojis);
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const resizedFile = await resizeImage(file, 1920, 1080);
        const reader = new FileReader();
        reader.onloadend = () => {
          enterPreviewStage(reader.result as string, resizedFile);
        };
        reader.readAsDataURL(resizedFile);
      } catch (error) {
        console.error("Image resize failed:", error);
        toast({ title: 'Image Error', description: `Could not process the selected image.`, variant: 'destructive' });
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
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
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
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            try {
                const resizedFile = await resizeImage(file, 1920, 1080);
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (isMountedRef.current && reader.result) {
                        enterPreviewStage(reader.result as string, resizedFile);
                    }
                };
                reader.readAsDataURL(resizedFile);
            } catch (err) {
                console.error("Failed to resize image", err);
                toast({ title: 'Image Error', description: 'Could not process the captured image.', variant: 'destructive' });
            }
          }
        }, 'image/jpeg');
        stopCamera();
      }
    }
  };
  
  const resetFlow = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setFilters(initialFilters);
    setTexts([]);
    setEmojis([]);
    setActiveTextId(null);
    setActiveEmojiId(null);
    setHistory([]);
    setHistoryIndex(-1);
    setStage('select');
    stopCamera();
    setIsCropping(false);
  };
  
  const handleFinalSubmission = async () => {
    if (!imagePreview || !imageContainerRef.current) {
        toast({ title: 'Error', description: 'No image to submit.', variant: 'destructive' });
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        toast({ title: 'Error', description: 'Could not process image.', variant: 'destructive' });
        return;
    }

    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = imagePreview;

    await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
    });

    const { naturalWidth, naturalHeight } = image;
    const { width: previewWidth, height: previewHeight } = imageContainerRef.current.getBoundingClientRect();
    
    const scaleX = naturalWidth / previewWidth;
    const scaleY = naturalHeight / previewHeight;

    canvas.width = naturalWidth;
    canvas.height = naturalHeight;

    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) hue-rotate(${filters.hueRotate}deg) blur(${filters.blur}px)`;
    ctx.drawImage(image, 0, 0);
    ctx.filter = 'none';

    emojis.forEach(emoji => {
      const fontSize = emoji.size * Math.min(scaleX, scaleY);
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowOffsetX = 2 * Math.min(scaleX, scaleY);
      ctx.shadowOffsetY = 2 * Math.min(scaleX, scaleY);
      ctx.shadowBlur = 4 * Math.min(scaleX, scaleY);
      
      const emojiCenterX = (emoji.position.x + (emoji.size / 2) + 8) * scaleX;
      const emojiCenterY = (emoji.position.y + (emoji.size / 2) + 8) * scaleY;
      
      ctx.fillText(emoji.content, emojiCenterX, emojiCenterY);
    });

    texts.forEach(text => {
        const fontSize = text.fontSize * Math.min(scaleX, scaleY);
        const genericFamily = fonts.find(f => f.name === text.fontFamily)?.family || 'sans-serif';
        ctx.font = `bold ${fontSize}px "${text.fontFamily}", ${genericFamily}`;
        ctx.fillStyle = text.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowOffsetX = 2 * Math.min(scaleX, scaleY);
        ctx.shadowOffsetY = 2 * Math.min(scaleX, scaleY);
        ctx.shadowBlur = 4 * Math.min(scaleX, scaleY);
        
        const textX = (text.position.x + previewWidth / 2) * scaleX;
        const textY = (text.position.y + text.fontSize) * scaleY;
        
        ctx.fillText(text.content, textX, textY);
    });

    toast({
      title: 'Submission Successful!',
      description: 'Your photo has been entered into the challenge.'
    });
    router.push('/');
  }

  const handleResetFilters = () => {
    const newFilters = initialFilters;
    setFilters(newFilters);
    recordHistory({ filters: newFilters, texts, emojis });
  }

  const handleResetAllEdits = () => {
    const freshState: EditorState = { filters: initialFilters, texts: [], emojis: [] };
    setFilters(freshState.filters);
    setTexts(freshState.texts);
    setEmojis(freshState.emojis);
    recordHistory(freshState);
    toast({
        title: 'Edits Reset',
        description: 'All filters, text, and emojis have been cleared.',
    });
  }
  
  const handleCropComplete = async (croppedImageSrc: string) => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImagePreview(croppedImageSrc);
    
    try {
        const response = await fetch(croppedImageSrc);
        const blob = await response.blob();
        const tempFile = new File([blob], imageFile?.name || 'cropped.jpg', {
            type: blob.type,
        });
        const resizedFile = await resizeImage(tempFile, 1920, 1080);
        setImageFile(resizedFile);
    } catch (error) {
        console.error("Could not process cropped image:", error);
        toast({
            variant: 'destructive',
            title: 'Failed to apply crop.',
            description: 'There was an issue processing the cropped image.',
        });
    }

    const initialState: EditorState = { filters: initialFilters, texts: [], emojis: [] };
    setHistory([initialState]);
    setHistoryIndex(0);
    setFilters(initialState.filters);
    setTexts(initialState.texts);
    setEmojis(initialState.emojis);
    
    setIsCropping(false);
    toast({
        title: 'Crop Applied',
        description: 'Undo/Redo history has been reset.',
    });
};

  const handleAddText = () => {
    const newId = Date.now();
    const newText: TextElement = {
      id: newId,
      content: 'Your Text',
      position: { x: 0, y: 0 },
      color: '#FFFFFF',
      fontFamily: 'Inter',
      fontSize: 32,
    };
    const newTexts = [...texts, newText];
    setTexts(newTexts);
    recordHistory({ filters, texts: newTexts, emojis });

    setActiveEmojiId(null);
    setActiveTextId(newId);
    setEditPanel('text');
    setIsEditPopoverOpen(true);
  };

  const handleTextUpdate = (id: number, newContent: string) => {
    setTexts(texts.map(t => (t.id === id ? { ...t, content: newContent } : t)));
  };

  const handleDragStop = (id: number, data: { x: number; y: number }) => {
    const newTexts = texts.map(t => (t.id === id ? { ...t, position: { ...data } } : t));
    setTexts(newTexts);
    recordHistory({ filters, texts: newTexts, emojis });
  };
  
  const handleTextColorChange = (color: string) => {
    if (!activeTextId) return;
    setTexts(texts.map(t => t.id === activeTextId ? { ...t, color } : t));
  };
  
  const handleFontChange = (fontFamily: string) => {
    if (!activeTextId) return;
    setTexts(texts.map(t => (t.id === activeTextId ? { ...t, fontFamily } : t)));
  };
  
  const handleFontSizeChange = (value: number[]) => {
    if (!activeTextId) return;
    setTexts(
      texts.map(t => (t.id === activeTextId ? { ...t, fontSize: value[0] } : t))
    );
  };

  const handleDeleteText = () => {
    if (!activeTextId) return;
    const newTexts = texts.filter(t => t.id !== activeTextId);
    setTexts(newTexts);
    recordHistory({ filters, texts: newTexts, emojis });

    setActiveTextId(null);
    setIsEditPopoverOpen(false);
  };

  const handleAddEmoji = (emoji: string) => {
    const newId = Date.now();
    const newEmoji: EmojiElement = {
      id: newId,
      content: emoji,
      position: { x: 0, y: 0 },
      size: 48,
    };
    const newEmojis = [...emojis, newEmoji];
    setEmojis(newEmojis);
    recordHistory({ filters, texts, emojis: newEmojis });
  };

  const handleEmojiDragStop = (id: number, data: { x: number; y: number }) => {
    const newEmojis = emojis.map(e => (e.id === id ? { ...e, position: { ...data } } : e));
    setEmojis(newEmojis);
    recordHistory({ filters, texts, emojis: newEmojis });
  };

  const handleEmojiSizeChange = (value: number[]) => {
    if (!activeEmojiId) return;
    setEmojis(
      emojis.map(e => (e.id === activeEmojiId ? { ...e, size: value[0] } : e))
    );
  };

  const handleDeleteEmoji = () => {
    if (!activeEmojiId) return;
    const newEmojis = emojis.filter(e => e.id !== activeEmojiId);
    setEmojis(newEmojis);
    recordHistory({ filters, texts, emojis: newEmojis });

    setActiveEmojiId(null);
    setIsEditPopoverOpen(false);
  };
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handleSuggestCaption = async () => {
    if (!imageFile) {
        toast({ title: 'No Image', description: 'Please select an image first.', variant: 'destructive' });
        return;
    }
    setIsCaptionLoading(true);
    try {
        const dataUri = await fileToDataUri(imageFile);
        const result = await suggestCaption(dataUri);
        if (result.caption) {
            setCaption(result.caption);
            toast({ title: 'Caption Suggested!', description: 'The AI has generated a caption for you.' });
        } else {
            throw new Error(result.error || 'Failed to get caption.');
        }
    } catch(error: any) {
        toast({ title: 'AI Error', description: error.message || 'Could not suggest a caption. Please try again.', variant: 'destructive'});
    } finally {
        setIsCaptionLoading(false);
    }
  }

  const handlePopoverOpenChange = (open: boolean) => {
    if (!open) {
      // Record history as the popover closes
      if (isEditPopoverOpen) {
        recordHistory({ filters, texts, emojis });
      }
      setActiveTextId(null);
      setActiveEmojiId(null);
    }
    setIsEditPopoverOpen(open);
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      stopCamera();
    };
  }, [imagePreview]);


  const activeText = texts.find(t => t.id === activeTextId);
  const activeEmoji = emojis.find(e => e.id === activeEmojiId);

  if (stage === 'preview' && imagePreview) {
    return (
      <>
        <AlertDialog open={isDiscardWarningOpen} onOpenChange={setIsDiscardWarningOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Discard Edits?</AlertDialogTitle>
              <AlertDialogDescription>
                If you go back, all your edits will be lost. Are you sure you want to discard your changes?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Editing</AlertDialogCancel>
              <AlertDialogAction onClick={resetFlow} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Discard</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      
        <div className="w-full max-w-lg mx-auto flex flex-col bg-background" style={{height: 'calc(100vh - 8rem)'}}>
          <header className="flex items-center justify-between p-2 border-b flex-shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setIsDiscardWarningOpen(true)}>
                  <ArrowLeft className="h-5 w-5" />
                  <span className="sr-only">Go back</span>
              </Button>
              <h1 className="text-lg font-semibold">Edit & Submit</h1>
              <Button onClick={handleFinalSubmission} size="sm">
                  Submit
              </Button>
          </header>

          <main 
            ref={imageContainerRef} 
            className="flex-1 relative w-full bg-black/90 overflow-hidden" 
            onClick={() => {setActiveTextId(null); setActiveEmojiId(null); handlePopoverOpenChange(false);}}
          >
              <Image 
                src={imagePreview} 
                alt="Submission preview" 
                fill 
                className="object-contain" 
                sizes="(max-width: 512px) 100vw, 512px" 
                style={{
                  filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) invert(${filters.invert}%) hue-rotate(${filters.hueRotate}deg) blur(${filters.blur}px)`
                }}
              />
              
              {emojis.map((emoji) => (
                <DraggableEmoji
                  key={emoji.id}
                  emoji={emoji}
                  isActive={emoji.id === activeEmojiId}
                  onDragStop={(_, data) => handleEmojiDragStop(emoji.id, data)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTextId(null);
                    setActiveEmojiId(emoji.id);
                    setEditPanel('emoji');
                    setIsEditPopoverOpen(true);
                  }}
                />
              ))}

              {texts.map((text) => (
                <DraggableText
                  key={text.id}
                  text={text}
                  isActive={text.id === activeTextId}
                  onTextUpdate={(e) => handleTextUpdate(text.id, e.target.value)}
                  onDragStop={(_, data) => handleDragStop(text.id, data)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveEmojiId(null);
                    setActiveTextId(text.id);
                    setEditPanel('text');
                    setIsEditPopoverOpen(true);
                  }}
                />
              ))}

              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 bg-gradient-to-t from-black/60 to-transparent">
                <div className="relative">
                    <Textarea 
                      placeholder="Add a creative caption..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="bg-black/30 border-none text-white placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-primary/50 text-left resize-none pr-10"
                      rows={2}
                    />
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1 top-1 h-8 w-8 text-white hover:bg-white/20 hover:text-white"
                        onClick={handleSuggestCaption}
                        disabled={isCaptionLoading}
                        aria-label="Suggest Caption"
                    >
                        {isCaptionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    </Button>
                </div>
              </div>
          </main>
          
          <footer className="flex-shrink-0 border-t bg-background">
            <div className="flex items-center justify-around p-1 overflow-x-auto">
              <Button variant="ghost" className="flex-col h-auto p-2 gap-1" onClick={handleResetAllEdits}><RefreshCcw className="h-5 w-5" /><span className="text-xs">Reset</span></Button>
              <Button variant="ghost" className="flex-col h-auto p-2 gap-1" onClick={() => setIsCropping(true)}><Crop className="h-5 w-5" /><span className="text-xs">Crop</span></Button>
              
              <Popover open={isEditPopoverOpen} onOpenChange={handlePopoverOpenChange}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="flex-col h-auto p-2 gap-1" onClick={() => { setEditPanel('filters'); setActiveTextId(null); setActiveEmojiId(null); setIsEditPopoverOpen(true)}}>
                        <SlidersHorizontal className="h-5 w-5" /><span className="text-xs">Filters</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" side="top" align="center">
                  {editPanel === 'text' && activeText ? (
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium leading-none">Edit Text</h4>
                        <Button variant="ghost" size="icon" onClick={handleDeleteText} className="text-destructive h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="text-input">Content</Label>
                          <Input
                              id="text-input"
                              value={activeText.content}
                              onChange={(e) => handleTextUpdate(activeText.id, e.target.value)}
                          />
                      </div>
                       <div className="space-y-2">
                          <Label>Font</Label>
                          <div className="grid grid-cols-2 gap-2">
                              {fonts.map(font => (
                                  <Button
                                      key={font.name}
                                      variant={activeText.fontFamily === font.name ? 'secondary' : 'outline'}
                                      size="sm"
                                      onClick={() => handleFontChange(font.name)}
                                      className={`h-auto py-2 ${font.className}`}
                                  >
                                      {font.name}
                                  </Button>
                              ))}
                          </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex flex-wrap gap-2">
                          {textColors.map(color => (
                            <button 
                              key={color}
                              onClick={() => handleTextColorChange(color)}
                              className="w-6 h-6 rounded-full border-2"
                              style={{ backgroundColor: color, borderColor: activeText.color === color ? 'hsl(var(--primary))' : 'transparent' }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="font-size">Size</Label>
                        <Slider
                            id="font-size"
                            value={[activeText.fontSize]}
                            min={12}
                            max={128}
                            step={1}
                            onValueChange={handleFontSizeChange}
                            onValueCommit={() => recordHistory({ filters, texts, emojis })}
                        />
                       </div>
                      <Button onClick={() => setIsEditPopoverOpen(false)}>Done</Button>
                    </div>
                  ) : editPanel === 'emoji' && activeEmoji ? (
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium leading-none">Edit Emoji</h4>
                            <Button variant="ghost" size="icon" onClick={handleDeleteEmoji} className="text-destructive h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="emoji-size">Size</Label>
                            <Slider
                                id="emoji-size"
                                value={[activeEmoji.size]}
                                min={12}
                                max={128}
                                step={1}
                                onValueChange={handleEmojiSizeChange}
                                onValueCommit={() => recordHistory({ filters, texts, emojis })}
                            />
                        </div>
                        <Button onClick={() => setIsEditPopoverOpen(false)}>Done</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-medium leading-none">Filters</h4>
                                <p className="text-sm text-muted-foreground">Adjust your photo's look.</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleResetFilters} className="h-8 w-8 flex-shrink-0">
                                <RotateCcw className="h-4 w-4" /><span className="sr-only">Reset filters</span>
                            </Button>
                        </div>
                        <div className="grid gap-2 text-xs">
                            <div className="grid grid-cols-5 items-center gap-2">
                                <Label htmlFor="brightness" className="col-span-1">Bright</Label>
                                <Slider id="brightness" value={[filters.brightness]} max={200} step={1} onValueChange={(v) => setFilters(f => ({ ...f, brightness: v[0] }))} onValueCommit={(v) => recordHistory({ filters: { ...filters, brightness: v[0] }, texts, emojis })} className="col-span-4" />
                            </div>
                            <div className="grid grid-cols-5 items-center gap-2">
                                <Label htmlFor="contrast" className="col-span-1">Contrast</Label>
                                <Slider id="contrast" value={[filters.contrast]} max={200} step={1} onValueChange={(v) => setFilters(f => ({ ...f, contrast: v[0] }))} onValueCommit={(v) => recordHistory({ filters: { ...filters, contrast: v[0] }, texts, emojis })} className="col-span-4" />
                            </div>
                            <div className="grid grid-cols-5 items-center gap-2">
                                <Label htmlFor="saturate" className="col-span-1">Saturate</Label>
                                <Slider id="saturate" value={[filters.saturate]} max={200} step={1} onValueChange={(v) => setFilters(f => ({ ...f, saturate: v[0] }))} onValueCommit={(v) => recordHistory({ filters: { ...filters, saturate: v[0] }, texts, emojis })} className="col-span-4" />
                            </div>
                            <div className="grid grid-cols-5 items-center gap-2">
                                <Label htmlFor="grayscale" className="col-span-1">Grayscale</Label>
                                <Slider id="grayscale" value={[filters.grayscale]} max={100} step={1} onValueChange={(v) => setFilters(f => ({ ...f, grayscale: v[0] }))} onValueCommit={(v) => recordHistory({ filters: { ...filters, grayscale: v[0] }, texts, emojis })} className="col-span-4" />
                            </div>
                             <div className="grid grid-cols-5 items-center gap-2">
                                <Label htmlFor="sepia" className="col-span-1">Sepia</Label>
                                <Slider id="sepia" value={[filters.sepia]} max={100} step={1} onValueChange={(v) => setFilters(f => ({ ...f, sepia: v[0] }))} onValueCommit={(v) => recordHistory({ filters: { ...filters, sepia: v[0] }, texts, emojis })} className="col-span-4" />
                            </div>
                             <div className="grid grid-cols-5 items-center gap-2">
                                <Label htmlFor="invert" className="col-span-1">Invert</Label>
                                <Slider id="invert" value={[filters.invert]} max={100} step={1} onValueChange={(v) => setFilters(f => ({ ...f, invert: v[0] }))} onValueCommit={(v) => recordHistory({ filters: { ...filters, invert: v[0] }, texts, emojis })} className="col-span-4" />
                            </div>
                             <div className="grid grid-cols-5 items-center gap-2">
                                <Label htmlFor="hueRotate" className="col-span-1">Hue</Label>
                                <Slider id="hueRotate" value={[filters.hueRotate]} max={360} step={1} onValueChange={(v) => setFilters(f => ({ ...f, hueRotate: v[0] }))} onValueCommit={(v) => recordHistory({ filters: { ...filters, hueRotate: v[0] }, texts, emojis })} className="col-span-4" />
                            </div>
                             <div className="grid grid-cols-5 items-center gap-2">
                                <Label htmlFor="blur" className="col-span-1">Blur</Label>
                                <Slider id="blur" value={[filters.blur]} max={10} step={0.1} onValueChange={(v) => setFilters(f => ({ ...f, blur: v[0] }))} onValueCommit={(v) => recordHistory({ filters: { ...filters, blur: v[0] }, texts, emojis })} className="col-span-4" />
                            </div>
                        </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="flex-col h-auto p-2 gap-1">
                    <Smile className="h-5 w-5" /><span className="text-xs">Emoji</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-60 overflow-y-auto p-2" side="top" align="center">
                  <div className="grid grid-cols-8 gap-1">
                    {emojiList.map(emoji => (
                      <button key={emoji} onClick={() => handleAddEmoji(emoji)} className="text-xl rounded-md p-1 hover:bg-muted transition-colors">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" className="flex-col h-auto p-2 gap-1" onClick={handleAddText}><Type className="h-5 w-5" /><span className="text-xs">Text</span></Button>

              <div className="h-6 border-l mx-2"></div>

              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={handleUndo} disabled={historyIndex <= 0}><Undo className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo className="h-5 w-5" /></Button>
            </div>
          </footer>
        </div>
        
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

  // Select stage
  return (
    <div className="w-full max-w-lg mx-auto py-8">
      <div className="space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Submit Your Photo</h1>
            <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
                Upload your best shot for today's challenge.
            </p>
        </div>
        <Card className="w-full max-w-md mx-auto bg-background/80 backdrop-blur-sm">
        <CardHeader>
            <CardTitle>Challenge: {challengeTopic}</CardTitle>
            <CardDescription>
            {challengeDescription}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {videoStream ? (
                  <div className='flex flex-col items-center gap-4'>
                    <div className='w-full rounded-lg overflow-hidden border relative'>
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
                        className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 hover:text-white rounded-full z-10"
                      >
                        <SwitchCamera className="h-5 w-5" />
                      </Button>
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
                    <Button className="w-full h-12 text-base" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-5 w-5" /> Upload Photo
                        <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </Button>
                    <Button variant="outline" className="w-full h-12 text-base" onClick={() => startCamera(facingMode)}>
                      <Camera className="mr-2 h-5 w-5" /> Use Camera
                    </Button>
                  </>
                )}
            </div>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
