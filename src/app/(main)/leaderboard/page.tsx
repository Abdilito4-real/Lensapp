
'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Flame, Heart, LogIn } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, collectionGroup, where } from 'firebase/firestore';
import type { UserProfile, Submission } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';


function LeaderboardSkeleton() {
    return (
         <div className="space-y-8">
            <div className="text-center">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-5 w-2/3 mx-auto mt-2" />
            </div>
            <Tabs defaultValue="streaks" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="streaks" disabled>Top Streaks</TabsTrigger>
                    <TabsTrigger value="submissions" disabled>Top Submissions</TabsTrigger>
                </TabsList>
                <TabsContent value="streaks" className="mt-6">
                     <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Card key={index}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-full" />
                                        <Skeleton className="h-6 w-32" />
                                    </div>
                                    <Skeleton className="h-6 w-20" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function LeaderboardContent() {
    const firestore = useFirestore();
    const { user } = useUser();

    const topStreaksQuery = useMemoFirebase(() => 
        (firestore && user) ? query(collection(firestore, 'userProfiles'), orderBy('currentStreak', 'desc'), limit(10)) : null,
        [firestore, user]
    );
    const { data: topStreaks, isLoading: streaksLoading } = useCollection<UserProfile>(topStreaksQuery);

    const topSubmissionsQuery = useMemoFirebase(() => 
        (firestore && user) ? query(
            collectionGroup(firestore, 'submissions'), 
            where('moderationStatus', '==', 'approved'),
            orderBy('upvoteCount', 'desc'), 
            limit(10)
        ) : null,
        [firestore, user]
    );
    const { data: topSubmissions, isLoading: submissionsLoading } = useCollection<Submission>(topSubmissionsQuery);

    const isDataLoading = streaksLoading || submissionsLoading;

     return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Leaderboards</h1>
                <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
                    See who's on top. Check out the highest streaks and most upvoted photos.
                </p>
            </div>
            <Tabs defaultValue="streaks" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="streaks">Top Streaks</TabsTrigger>
                    <TabsTrigger value="submissions">Top Submissions</TabsTrigger>
                </TabsList>
                <TabsContent value="streaks" className="mt-6">
                    <div className="space-y-4">
                        {isDataLoading ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <Card key={index}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-6 w-32" />
                                        </div>
                                        <Skeleton className="h-6 w-20" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : topStreaks && topStreaks.length > 0 ? (
                            topStreaks.map((user, index) => (
                                <Card key={user.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold w-6 text-center text-muted-foreground">{index + 1}</span>
                                            <Avatar>
                                                <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
                                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.displayName}</span>
                                        </div>
                                        <Badge variant="secondary" className="gap-1.5 pl-2">
                                            <Flame className="h-4 w-4 text-accent" />
                                            {user.currentStreak} days
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-center py-8">No streaks on the board yet!</p>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="submissions" className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isDataLoading ? (
                             Array.from({ length: 4 }).map((_, index) => (
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
                             ))
                        ) : topSubmissions && topSubmissions.length > 0 ? (
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
                                                        <AvatarFallback>U</AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm font-medium">User</span>
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

export default function LeaderboardPage() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return <LeaderboardSkeleton />;
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-[50vh]">
                 <LogIn className="w-16 h-16 text-muted-foreground" />
                 <h2 className="text-2xl font-bold">Please Log In</h2>
                 <p className="text-muted-foreground">Log in to view the leaderboards and see how you rank.</p>
            </div>
        )
    }

    return <LeaderboardContent />;
}
