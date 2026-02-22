'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Heart, LogIn } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, collectionGroup, where } from 'firebase/firestore';
import type { UserProfile, Submission } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    // Query is now dependent on the user object
    const topSubmissionsQuery = useMemoFirebase(() =>
        (firestore && user) // <-- FIX: Only create query if user is logged in
            ? query(
                collectionGroup(firestore, 'submissions'),
                where('moderationStatus', '==', 'approved'),
                orderBy('upvoteCount', 'desc'),
                limit(10)
            )
            : null,
        [firestore, user] // Dependency array includes user
    );

    // The hook will now receive null if the user is not logged in, preventing the query
    const { data: topSubmissions, isLoading: submissionsLoading } = useCollection<Submission>(topSubmissionsQuery);

    const isLoading = isUserLoading || (user && submissionsLoading);

    // 1. Loading State: Show skeletons while checking auth or fetching data
    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <Skeleton className="h-10 w-1/2 mx-auto" />
                    <Skeleton className="h-5 w-2/3 mx-auto mt-2" />
                </div>
                <Tabs defaultValue="submissions" className="w-full">
                    <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="submissions">Top Submissions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="submissions" className="mt-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Card key={index} className="overflow-hidden group">
                                    <CardContent className="p-0 relative">
                                        <div className="relative aspect-[4/3]">
                                            <Skeleton className="h-full w-full" />
                                        </div>
                                        <div className="p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <Skeleton className="h-5 w-24" />
                                            </div>
                                            <Skeleton className="h-6 w-16" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        );
    }
    
    // 2. Logged Out State: Show a prompt to log in
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-[50vh]">
                 <LogIn className="w-16 h-16 text-muted-foreground" />
                 <h2 className="text-2xl font-bold">Please Log In</h2>
                 <p className="text-muted-foreground">Log in to view the leaderboards and see who's on top.</p>
            </div>
        );
    }

    // 3. Data State: Display the leaderboard
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Leaderboards</h1>
                <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
                    See who's on top. Check out the most upvoted photos.
                </p>
            </div>
            <Tabs defaultValue="submissions" className="w-full">
                <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="submissions">Top Submissions</TabsTrigger>
                </TabsList>
                <TabsContent value="submissions" className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {topSubmissions && topSubmissions.length > 0 ? (
                            topSubmissions.map((submission, index) => {
                                return (
                                    <Card key={submission.id} className="overflow-hidden group">
                                        <CardContent className="p-0 relative">
                                            <div className="absolute top-2 left-2 z-10 bg-black/50 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg">{index + 1}</div>
                                            <div className="relative aspect-[4/3]">
                                                <Image src={submission.photoUrl} alt="Top submission" fill sizes="(max-width: 640px) 90vw, 45vw" className="object-cover" />
                                            </div>
                                            <div className="p-4 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>?</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium italic text-muted-foreground">Submitter info private</span>
                                                </div>
                                                <Badge variant="outline" className="gap-1.5">
                                                    <Heart className="h-3.5 w-3.5 text-accent fill-current" />
                                                    {submission.upvoteCount}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })
                        ) : (
                            <div className="col-span-1 sm:col-span-2 text-center py-8">
                                <p className="text-muted-foreground">No submissions have been upvoted yet.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}