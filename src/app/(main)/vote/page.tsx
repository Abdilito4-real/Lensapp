'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { submissions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

export default function VotePage() {
  const [voted, setVoted] = useState<Record<string, boolean>>({});

  const handleVote = (submissionId: string) => {
    setVoted(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Vote on Submissions</h1>
        <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
          Help decide today's winner. Your votes are anonymous.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {submissions.map((submission) => {
          const image = PlaceHolderImages.find(p => p.id === submission.imageId);
          return (
            <Card key={submission.id} className="overflow-hidden group relative">
              <CardContent className="p-0">
                <div className="aspect-w-3 aspect-h-4">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt="User submission"
                      width={600}
                      height={800}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={image.imageHint}
                    />
                  )}
                </div>
                <div className="absolute bottom-4 right-4">
                  <Button
                    size="icon"
                    className={cn(
                        "rounded-full h-12 w-12 shadow-lg transition-all duration-300",
                        voted[submission.id] ? 'bg-accent text-accent-foreground scale-110' : 'bg-background/50 backdrop-blur-sm text-foreground hover:bg-background'
                    )}
                    onClick={() => handleVote(submission.id)}
                  >
                    <Heart className={cn("h-6 w-6", voted[submission.id] && "fill-current")} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
