'use client';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';

interface FlashcardProps {
  front: React.ReactNode;
  back: React.ReactNode;
}

export function Flashcard({ front, back }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-full h-48 [perspective:1000px] cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <Card
        className={cn(
          'relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front */}
        <CardContent className="absolute w-full h-full flex flex-col items-center justify-center p-4 [backface-visibility:hidden]">
          <p className="text-lg font-semibold">{front}</p>
          <div className="absolute bottom-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <RotateCcw className="h-4 w-4"/>
          </div>
        </CardContent>
        {/* Back */}
        <CardContent className="absolute w-full h-full flex flex-col items-center justify-center p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-secondary text-secondary-foreground">
          <p>{back}</p>
           <div className="absolute bottom-2 right-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <RotateCcw className="h-4 w-4"/>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
