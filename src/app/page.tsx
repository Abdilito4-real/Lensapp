'use client';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function WelcomePage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();

    const logoImage = PlaceHolderImages.find(p => p.id === 'app-logo');

    const handleEnterApp = () => {
        if (user) {
            router.push('/community');
        } else {
            router.push('/login');
        }
    };
    
    const handleSubmitPhoto = () => {
        if (user) {
            router.push('/submit');
        } else {
            router.push('/login');
        }
    };

    if (!logoImage) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="container flex h-20 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-3">
                            <Image 
                                src={logoImage.imageUrl} 
                                alt="Lens logo" 
                                width={48} 
                                height={48} 
                                className="w-12 h-12 rounded-lg object-cover" 
                                priority 
                                data-ai-hint={logoImage.imageHint}
                            />
                            <span className="font-bold text-xl">Lens</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button onClick={handleEnterApp} disabled={isUserLoading}>
                            {isUserLoading ? 'Loading...' : (user ? 'Enter App' : 'Login / Sign Up')}
                        </Button>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <div className="relative w-48 h-48 mb-8">
                    <Image 
                        src={logoImage.imageUrl} 
                        alt="Lens logo" 
                        layout="fill" 
                        objectFit="contain"
                        data-ai-hint={logoImage.imageHint}
                    />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                    Welcome to Lens
                </h1>
                <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-8">
                    Join daily photo challenges, vote on your favorite submissions, and climb the leaderboards to become a photography champion.
                </p>
                <Button size="lg" onClick={handleSubmitPhoto} disabled={isUserLoading}>
                    {isUserLoading ? 'Loading...' : 'Submit Your Photo'}
                </Button>
            </main>
        </div>
    );
}
