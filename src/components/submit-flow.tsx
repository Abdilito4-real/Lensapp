
'use client';

import { useState, useRef, type ChangeEvent, useEffect, useCallback } from 'react';
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
  Trash2,
  SwitchCamera,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { MusicSearch } from './music-search';
import type { Song } from '@/lib/musicService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ImageCropper } from './image-cropper';
import Draggable from 'react-draggable';
import { Input } from '@/components/ui/input';
import { AudioTrimmer } from './audio-trimmer';
import { LensLoader } from './lens-loader';
import { Howl } from 'howler';
import { getAudioUrl } from '@/lib/get-audio-url';

type Stage = 'select' | 'preview';

type TextElement = {
  id: number;
  content: string;
  position: { x: number; y: number };
  color: string;
  fontFamily: string;
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
  onDoubleClick,
}: {
  text: TextElement;
  onTextUpdate: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDragStop: (e: any, data: { x: number; y: number }) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
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
        className="absolute cursor-move p-2"
        onDoubleClick={onDoubleClick}
      >
        <Textarea
          value={text.content}
          onChange={onTextUpdate}
          className="bg-transparent border-none focus-visible:ring-2 focus-visible:ring-primary resize-none text-center text-2xl font-bold p-0"
          style={{
            color: text.color,
            fontFamily: text.fontFamily,
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
  onDoubleClick,
}: {
  emoji: EmojiElement;
  onDragStop: (e: any, data: { x: number; y: number }) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
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
        className="absolute cursor-move p-2"
        style={{
          fontSize: `${emoji.size}px`,
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        }}
        onDoubleClick={onDoubleClick}
      >
        {emoji.content}
      </div>
    </Draggable>
  );
};

export function SubmitFlow({ challengeTopic }: { challengeTopic: string }) {
  const [stage, setStage] = useState<Stage>('select');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const [isPlaying, setIsPlaying] = useState(false);
  const [isSongLoading, setIsSongLoading] = useState(false);
  const audioRef = useRef<Howl | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const [caption, setCaption] = useState('');
  const [isMusicSearchOpen, setIsMusicSearchOpen] = useState(false);

  const [filters, setFilters] = useState(initialFilters);
  const [editPanel, setEditPanel] = useState<'filters' | 'text' | 'emoji' | null>(null);
  const [isEditPopoverOpen, setIsEditPopoverOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [showTrimmer, setShowTrimmer] = useState(false);

  const [texts, setTexts] = useState<TextElement[]>([]);
  const [emojis, setEmojis] = useState<EmojiElement[]>([]);
  const [activeTextId, setActiveTextId] = useState<number | null>(null);
  const [activeEmojiId, setActiveEmojiId] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        enterPreviewStage(reader.result as string, file);
      };
      reader.readAsDataURL(file);
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
        const dataUrl = canvas.toDataURL('image/jpeg');
        canvas.toBlob(blob => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            enterPreviewStage(dataUrl, file);
          }
        }, 'image/jpeg');
        stopCamera();
      }
    }
  };
  
  const resetFlow = () => {
    if (audioRef.current) {
      audioRef.current.unload();
      audioRef.current = null;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
    setSelectedSong(null);
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

    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%)`;
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
        const fontSize = 32 * Math.min(scaleX, scaleY);
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
        const textY = (text.position.y + 32) * scaleY;
        
        ctx.fillText(text.content, textX, textY);
    });

    toast({
      title: 'Submission Successful!',
      description: selectedSong
        ? `Your photo with "${selectedSong.title}" has been submitted.`
        : 'Your photo has been entered into the challenge.'
    });
    router.push('/');
  }

  const togglePlayback = () => {
    const sound = audioRef.current;
    if (!sound || !selectedSong) return;

    if (sound.playing()) {
      sound.pause();
    } else {
      const { startTime = 0, endTime } = selectedSong;
      const currentTime = sound.seek() as number;

      if (endTime && currentTime >= endTime) {
        sound.seek(startTime);
      }
      
      sound.play();

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (endTime) {
        const remainingDuration = (endTime - (sound.seek() as number)) * 1000;
        if (remainingDuration > 0) {
            timeoutRef.current = setTimeout(() => {
                sound.pause();
            }, remainingDuration);
        }
      }
    }
  };

  const handleSongSelected = (song: Song | null) => {
    if (audioRef.current) {
      audioRef.current.unload();
      audioRef.current = null;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setSelectedSong(null);
    
    if (!song || !song.title || !song.artist) {
      return;
    }

    setIsMusicSearchOpen(false);
    setSelectedSong(song);
    setIsSongLoading(true);

    getAudioUrl(song.title, song.artist).then((audioUrl) => {
      if (!isMountedRef.current) return;

      const sound = new Howl({
        src: [audioUrl],
        format: ['mp3'],
        html5: true,
        onplay: () => {
          if (isMountedRef.current) setIsPlaying(true);
        },
        onpause: () => {
          if (isMountedRef.current) setIsPlaying(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        },
        onend: () => {
          if (isMountedRef.current) setIsPlaying(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        },
        onload: () => {
            if (!isMountedRef.current) return;
            setIsSongLoading(false);
            
            const { startTime = 0 } = song;
            let { endTime } = song;
            const songDuration = sound.duration();

            if(endTime && songDuration && endTime > songDuration) {
              song.endTime = songDuration;
              endTime = songDuration;
            }

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
        },
        onloaderror: (id, error) => {
          console.error('Howl load error:', error, '| URL:', audioUrl);
          if (isMountedRef.current) {
            toast({ variant: 'destructive', title: 'Failed to load song.' });
            setIsSongLoading(false);
            setSelectedSong(null);
          }
        },
        onplayerror: (id, error) => {
            console.error('Howl play error:', error);
            if (isMountedRef.current) {
                toast({ variant: 'destructive', title: 'Playback failed.', description: 'Please try another song.' });
                setIsSongLoading(false);
                setSelectedSong(null);
            }
        }
      });
      
      audioRef.current = sound;
    }).catch((error: any) => {
        console.error("Failed to get audio URL:", error);
        if (isMountedRef.current) {
          toast({ 
              variant: 'destructive', 
              title: 'Audio Error',
              description: error.message || 'No preview available for this track.' 
          });
          setIsSongLoading(false);
          setSelectedSong(null);
        }
    });
  };

  const handleSegmentSelected = (startTime: number, endTime: number) => {
    if (selectedSong) {
      handleSongSelected({
        ...selectedSong,
        startTime,
        endTime,
        duration: endTime - startTime,
      });
    }
    setShowTrimmer(false);
  };
  
  const handleRemoveSong = () => {
    if (audioRef.current) {
      audioRef.current.unload();
      audioRef.current = null;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setSelectedSong(null);
  };
  
  const handleResetFilters = () => {
    const newFilters = initialFilters;
    setFilters(newFilters);
    recordHistory({ filters: newFilters, texts, emojis });
  }
  
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
  
  const handlePopoverClose = () => {
    if (isEditPopoverOpen) {
      recordHistory({ filters, texts, emojis });
    }
    setIsEditPopoverOpen(false);
    setActiveTextId(null);
    setActiveEmojiId(null);
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      audioRef.current?.unload();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);


  const activeText = texts.find(t => t.id === activeTextId);
  const activeEmoji = emojis.find(e => e.id === activeEmojiId);

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
              
              <Popover open={isEditPopoverOpen} onOpenChange={handlePopoverClose}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-auto p-2" onClick={() => { setEditPanel('filters'); setActiveTextId(null); setActiveEmojiId(null); setIsEditPopoverOpen(true)}}>
                        <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
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
                      <Button onClick={() => setIsEditPopoverOpen(false)}>OK</Button>
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
                        <Button onClick={() => setIsEditPopoverOpen(false)}>OK</Button>
                    </div>
                  ) : (
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
                                    onValueCommit={(value) => recordHistory({ filters: { ...filters, brightness: value[0] }, texts, emojis })}
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
                                    onValueCommit={(value) => recordHistory({ filters: { ...filters, contrast: value[0] }, texts, emojis })}
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
                                    onValueCommit={(value) => recordHistory({ filters: { ...filters, saturate: value[0] }, texts, emojis })}
                                    className="col-span-3"
                                />
                                <span className="text-sm text-muted-foreground font-mono justify-self-end">{filters.saturate}%</span>
                            </div>
                        </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={handleAddText}><Type className="h-5 w-5" /></Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-auto p-2">
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 max-h-60 overflow-y-auto p-2">
                  <div className="grid grid-cols-8 gap-1">
                    {emojiList.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleAddEmoji(emoji)}
                        className="text-xl rounded-md p-1 hover:bg-muted transition-colors"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={handleUndo} disabled={historyIndex <= 0}><Undo className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="h-auto p-2" onClick={handleRedo} disabled={historyIndex >= history.length - 1}><Redo className="h-5 w-5" /></Button>
          </div>

          <div ref={imageContainerRef} className="relative flex-1 w-full rounded-lg overflow-hidden bg-black mb-4" onDoubleClick={() => {setActiveTextId(null); setActiveEmojiId(null); handlePopoverClose();}}>
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
              
              {emojis.map((emoji) => (
                <DraggableEmoji
                  key={emoji.id}
                  emoji={emoji}
                  onDragStop={(_, data) => handleEmojiDragStop(emoji.id, data)}
                  onDoubleClick={(e) => {
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
                  onTextUpdate={(e) => handleTextUpdate(text.id, e.target.value)}
                  onDragStop={(_, data) => handleDragStop(text.id, data)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setActiveEmojiId(null);
                    setActiveTextId(text.id);
                    setEditPanel('text');
                    setIsEditPopoverOpen(true);
                  }}
                />
              ))}

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
                            {isSongLoading ? (
                                <LensLoader className="w-5 h-5" />
                            ) : (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowTrimmer(true)}
                                        className="h-8 w-8 flex-shrink-0 text-white hover:bg-white/10 hover:text-white"
                                    >
                                        <SlidersHorizontal className="h-4 w-4" />
                                    </Button>
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
                                        onClick={handleRemoveSong}
                                        className="h-8 w-8 flex-shrink-0 text-white hover:bg-white/10 hover:text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
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
                <MusicSearch 
                  key={String(isMusicSearchOpen)}
                  onSelectSong={handleSongSelected}
                />
            </DialogContent>
        </Dialog>

        {isCropping && imagePreview && (
            <ImageCropper 
                imageSrc={imagePreview}
                onClose={() => setIsCropping(false)}
                onCropComplete={handleCropComplete}
            />
        )}
        {showTrimmer && selectedSong && (
            <AudioTrimmer
              songTitle={selectedSong.title}
              songArtist={selectedSong.artist}
              onSelectSegment={handleSegmentSelected}
              onClose={() => setShowTrimmer(false)}
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
                <Button className="w-full" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" /> Upload Photo
                    <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => startCamera(facingMode)}>
                  <Camera className="mr-2 h-4 w-4" /> Use Camera
                </Button>
              </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
