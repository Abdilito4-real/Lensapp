
'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { submissions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function VotePage() {
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleVote = (submissionId: string) => {
    setVoted(prev => ({ ...prev, [submissionId]: !prev[submissionId] }));
    toast({
      title: 'Vote Cast!',
      description: 'Your vote has been recorded.',
    });
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
            <Card key={submission.id} className="overflow-hidden group">
              <CardContent className="p-0">
                <div className="aspect-[3/4] relative">
                  {image && (
                    <Image
                      src={image.imageUrl}
                      alt="User submission"
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                      data-ai-hint={image.imageHint}
                    />
                  )}
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
