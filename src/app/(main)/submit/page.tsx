'use client';

import { SubmitFlow } from "@/components/submit-flow";
import { currentChallenge } from "@/lib/data";
import { useUser } from "@/firebase";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SubmitPage() {
  const { user, isUserLoading } = useUser();

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
                <p className="text-muted-foreground max-w-sm">Log in to participate in the daily challenge and submit your photo.</p>
             </div>
             <Button asChild>
                <Link href="/login?redirectTo=/submit">Sign In to Continue</Link>
             </Button>
        </div>
    )
  }

  return (
    <div className="flex justify-center">
       <SubmitFlow challengeTopic={currentChallenge.title} challengeDescription={currentChallenge.description} />
    </div>
  );
}
