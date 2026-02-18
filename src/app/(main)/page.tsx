import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Countdown } from "@/components/countdown";
import { currentChallenge } from "@/lib/data";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Today's Challenge
        </h1>
        <p className="max-w-[700px] text-muted-foreground md:text-xl">
          A new photo challenge every day. Submit your best shot.
        </p>
      </div>

      <Card className="w-full max-w-2xl text-left shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">{currentChallenge.topic}</CardTitle>
          <CardDescription>{currentChallenge.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Challenge ends in:</p>
            <Countdown targetDate={currentChallenge.date} />
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href="/submit">
                    Submit Your Photo
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
