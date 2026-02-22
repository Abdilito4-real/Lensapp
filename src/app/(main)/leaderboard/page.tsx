'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Flame, Heart } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit, collectionGroup, where } from 'firebase/firestore';
import type { UserProfile, Submission } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage() {
    const { isUserLoading } = useUser();
    const firestore = useFirestore();

    const topStreaksQuery = useMemoFirebase(() => 
        (firestore && !isUserLoading)
            ? query(collection(firestore, 'userProfiles'), orderBy('currentStreak', 'desc'), limit(10)) 
            : null,
        [firestore, isUserLoading]
    );
    const { data: topStreaks, isLoading: streaksLoading } = useCollection<UserProfile>(topStreaksQuery);

    const topSubmissionsQuery = useMemoFirebase(() => 
        (firestore && !isUserLoading)
            ? query(
                collectionGroup(firestore, 'submissions'), 
                where('moderationStatus', '==', 'approved'),
                orderBy('upvoteCount', 'desc'), 
                limit(10)
              )
            : null,
        [firestore, isUserLoading]
    );
    const { data: topSubmissions, isLoading: submissionsLoading } = useCollection<Submission>(topSubmissionsQuery);

    const userProfilesQuery = useMemoFirebase(() => 
        (firestore && !isUserLoading)
            ? collection(firestore, 'userProfiles') 
            : null,
        [firestore, isUserLoading]
    );
    const { data: userProfiles, isLoading: profilesLoading } = useCollection<UserProfile>(userProfilesQuery);

    const userProfilesMap = useMemo(() => {
        if (!userProfiles) return new Map<string, UserProfile>();
        return new Map(userProfiles.map(p => [p.id, p]));
    }, [userProfiles]);

    const isLoading = streaksLoading || submissionsLoading || profilesLoading;

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
                        {isLoading ? (
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
                        {isLoading ? (
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
                                const user = userProfilesMap.get(submission.userId);
                                return (
                                    <Card key={submission.id} className="overflow-hidden group">
                                        <CardContent className="p-0 relative">
                                            <div className="absolute top-2 left-2 z-10 bg-black/50 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg">{index + 1}</div>
                                            <div className="relative aspect-[4/3]">
                                                <Image src={submission.photoUrl} alt="Top submission" fill sizes="(max-width: 640px) 90vw, 45vw" className="object-cover" />
                                            </div>
                                            <div className="p-4 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    {user &&
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={user.profileImageUrl} alt={user.displayName} />
                                                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    }
                                                    <span className="text-sm font-medium">{user?.displayName || 'Anonymous'}</span>
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
