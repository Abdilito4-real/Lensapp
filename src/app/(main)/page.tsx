'use client';

<<<<<<< HEAD
import { useUser } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, LogIn, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function HomePage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <Skeleton className="h-10 w-1/2 mx-auto" />
                    <Skeleton className="h-5 w-2/3 mx-auto mt-2" />
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                    <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                 </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-[50vh]">
                 <LogIn className="w-16 h-16 text-muted-foreground" />
                 <h2 className="text-2xl font-bold">Please Log In</h2>
                 <p className="text-muted-foreground">Log in to connect with the community.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Community</h1>
                <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
                    Manage your friends and connections.
                </p>
            </div>
            
            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Feature Update</AlertTitle>
                <AlertDescription>
                    To enhance privacy and security, user discovery and friend search features are currently being redesigned. Please check back later!
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>Find Friends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <Input 
                            type="text" 
                            placeholder="Search is temporarily disabled" 
                            disabled
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled>
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Friend Requests</CardTitle>
                        <CardDescription>You have no new friend requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm text-muted-foreground text-center py-4">No new requests.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>My Friends</CardTitle>
                        <CardDescription>Send streaks to your friends to keep them motivated.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground text-center py-4">You haven't added any friends yet.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Discover New People</CardTitle>
                        <CardDescription>Connect with other users on Lens.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex items-center justify-center text-center p-4 rounded-lg bg-muted">
                            <p className="text-sm text-muted-foreground">User discovery is currently unavailable.</p>
                       </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
=======
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page exists to resolve a routing conflict.
// It redirects any traffic aimed at the root of the '(main)' group to the correct '/community' page.
export default function MainRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/community');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
>>>>>>> fix-ai-cors-lcp-issues-15919772459331235715
}
