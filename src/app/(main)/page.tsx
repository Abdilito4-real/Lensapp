import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Countdown } from "@/components/countdown";
import { currentChallenge } from "@/lib/data";
import Link from 'next/link';
import { ArrowRight } from "lucide-react";
import Image from 'next/image';
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function HomePage() {
  const galleryImages = [
    'gallery-1',
    'gallery-2',
    'gallery-3',
    'gallery-4',
  ]
  .map(id => PlaceHolderImages.find(p => p.id === id))
  .filter((p): p is NonNullable<typeof p> => p !== undefined);

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
      
      <div className="w-full max-w-5xl pt-12 pb-4 md:pt-20 md:pb-8">
        <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl mb-12">
          Featured Snaps
        </h2>
        <div className="relative h-96 w-full flex justify-center items-center">
            {/* Left Pair */}
            {galleryImages[0] && (
                <div className="absolute w-48 h-64 md:w-56 md:h-72 transform -translate-x-20 -rotate-12 hover:-rotate-6 hover:scale-110 hover:z-10 transition-transform duration-300">
                    <Card className="h-full w-full overflow-hidden shadow-2xl">
                        <Image src={galleryImages[0].imageUrl} alt={galleryImages[0].description} layout="fill" objectFit="cover" className="transform scale-x-[-1]" data-ai-hint={galleryImages[0].imageHint} />
                    </Card>
                </div>
            )}
            {galleryImages[1] && (
                <div className="absolute w-40 h-52 md:w-44 md:h-60 transform -translate-x-8 rotate-6 hover:rotate-2 hover:scale-110 hover:z-10 transition-transform duration-300">
                    <Card className="h-full w-full overflow-hidden shadow-2xl">
                        <Image src={galleryImages[1].imageUrl} alt={galleryImages[1].description} layout="fill" objectFit="cover" data-ai-hint={galleryImages[1].imageHint} />
                    </Card>
                </div>
            )}

            {/* Right Pair */}
            {galleryImages[2] && (
                <div className="absolute w-48 h-64 md:w-56 md:h-72 transform translate-x-20 rotate-12 hover:rotate-6 hover:scale-110 hover:z-10 transition-transform duration-300">
                    <Card className="h-full w-full overflow-hidden shadow-2xl">
                        <Image src={galleryImages[2].imageUrl} alt={galleryImages[2].description} layout="fill" objectFit="cover" data-ai-hint={galleryImages[2].imageHint} />
                    </Card>
                </div>
            )}
            {galleryImages[3] && (
                <div className="absolute w-40 h-52 md:w-44 md:h-60 transform translate-x-8 -rotate-6 hover:-rotate-2 hover:scale-110 hover:z-10 transition-transform duration-300">
                    <Card className="h-full w-full overflow-hidden shadow-2xl">
                        <Image src={galleryImages[3].imageUrl} alt={galleryImages[3].description} layout="fill" objectFit="cover" className="transform scale-x-[-1]" data-ai-hint={galleryImages[3].imageHint} />
                    </Card>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
    