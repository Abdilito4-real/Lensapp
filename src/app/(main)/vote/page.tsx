
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
import { useUser } from '@/firebase';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function VotePage() {
  const { user, isUserLoading } = useUser();
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  if (isUserLoading) {
      return (
          <div className="flex items-center justify-center h-[50vh]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      )
  }

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 h-[50vh]">
             <LogIn className="w-16 h-16 text-muted-foreground" />
             <div className="space-y-2">
                <h2 className="text-2xl font-bold">Please Log In</h2>
                <p className="text-muted-foreground max-w-sm">Log in to vote on today's submissions and support the community.</p>
             </div>
             <Button asChild>
                <Link href="/login?redirectTo=/vote">Sign In to Continue</Link>
             </Button>
        </div>
    )
  }

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
        {submissions.map((submission, index) => {
          const submissionId = (submission as any).id || `sub-${index}`;
          const image = PlaceHolderImages.find(p => p.id === submission.photoUrl);

          return (
            <Card key={submissionId} className="overflow-hidden group">
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
                          voted[submissionId] ? 'bg-accent text-accent-foreground scale-110' : 'bg-background/50 backdrop-blur-sm text-foreground hover:bg-background'
                      )}
                      onClick={() => handleVote(submissionId)}
                    >
                      <Heart className={cn("h-6 w-6", voted[submissionId] && "fill-current")} />
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
