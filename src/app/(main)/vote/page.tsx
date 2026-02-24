'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Flame, Loader2, LogIn, Trophy, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, orderBy, limit, collectionGroup, where, doc } from 'firebase/firestore';
import type { UserProfile, Submission } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';

export default function VotePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [voted, setVoted] = useState<Record<string, boolean>>({});

    // Fetch Top Submissions (Daily Photos)
    const topSubmissionsQuery = useMemoFirebase(() =>
        (firestore && user)
            ? query(
                collectionGroup(firestore, 'submissions'),
                where('moderationStatus', '==', 'approved'),
                limit(15)
              )
            : null,
        [firestore, user]
    );
    const { data: topSubmissions, isLoading: submissionsLoading } = useCollection<Submission>(topSubmissionsQuery);

    // Fetch Top Streaks
    const topStreaksQuery = useMemoFirebase(() =>
        (firestore && user)
            ? query(collection(firestore, 'userProfiles'), orderBy('currentStreak', 'desc'), limit(15))
            : null,
        [firestore, user]
    );
    const { data: topStreaks, isLoading: streaksLoading } = useCollection<UserProfile>(topStreaksQuery);

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
                    <p className="text-muted-foreground max-w-sm">Log in to vote on today's submissions and see user streaks.</p>
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
            title: voted[submissionId] ? 'Vote Removed' : 'Vote Cast!',
            description: voted[submissionId] ? 'Your vote has been retracted.' : 'Your vote has been recorded.',
        });
    };

    const handleSupportStreak = (userName: string) => {
        toast({
            title: `Cheered for ${userName}!`,
            description: `You've sent some motivation to keep the streak alive!`,
        });
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Community & Voting</h1>
                <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
                    Vote on today's best shots and support the longest streaks.
                </p>
            </div>

            <Tabs defaultValue="streaks" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto">
                    <TabsTrigger value="streaks">User Streaks</TabsTrigger>
                    <TabsTrigger value="photos">Daily Photos</TabsTrigger>
                </TabsList>

                <TabsContent value="streaks" className="mt-8">
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {streaksLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-20 w-full rounded-xl" />
                            ))
                        ) : topStreaks && topStreaks.length > 0 ? (
                            topStreaks.map((profile, index) => (
                                <Card key={profile.id} className="overflow-hidden border-none bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-black text-muted-foreground/30 w-8">{index + 1}</span>
                                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                                                <AvatarImage src={profile.profileImageUrl} />
                                                <AvatarFallback>{profile.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold">{profile.displayName}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
                                                    <span className="text-sm font-semibold">{profile.currentStreak} day streak</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => handleSupportStreak(profile.displayName)}>
                                            Cheer ⚡
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-12">No streaks found yet. Start yours today!</p>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="photos" className="mt-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {submissionsLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
                            ))
                        ) : topSubmissions && topSubmissions.length > 0 ? (
                            topSubmissions.map((submission) => (
                                <SubmissionCard
                                    key={submission.id}
                                    submission={submission}
                                    isVoted={voted[submission.id]}
                                    onVote={() => handleVote(submission.id)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 bg-muted/30 rounded-2xl border-2 border-dashed">
                                <p className="text-muted-foreground">No approved submissions yet for today. Be the first!</p>
                                <Button asChild variant="link" className="mt-2">
                                    <Link href="/submit">Submit a photo</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

            </Tabs>
        </div>
    );
}

function SubmissionCard({ submission, isVoted, onVote }: { submission: Submission, isVoted: boolean, onVote: () => void }) {
    const firestore = useFirestore();
    const profileQuery = useMemoFirebase(() =>
        (firestore && submission.userId) ? doc(firestore, 'userProfiles', submission.userId) : null,
        [firestore, submission.userId]
    );
    const { data: profile } = useDoc<UserProfile>(profileQuery);

    return (
        <Card className="overflow-hidden group border-none shadow-xl bg-black">
            <CardContent className="p-0 relative">
                <div className="aspect-[3/4] relative">
                    <Image
                        src={submission.photoUrl}
                        alt="User submission"
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border border-white/20">
                                <AvatarImage src={profile?.profileImageUrl} />
                                <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                            </Avatar>
                            <span className="text-white text-sm font-medium drop-shadow-md">{profile?.displayName || 'Photographer'}</span>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                                "rounded-full h-10 w-10 backdrop-blur-md transition-all duration-300",
                                isVoted ? 'bg-accent text-accent-foreground scale-110' : 'bg-white/20 text-white hover:bg-white/40'
                            )}
                            onClick={(e) => {
                                e.preventDefault();
                                onVote();
                            }}
                        >
                            <Heart className={cn("h-5 w-5", isVoted && "fill-current")} />
                        </Button>
                    </div>

                    {!isVoted && (
                         <div className="absolute top-4 right-4">
                             <Badge className="bg-black/50 backdrop-blur-sm border-none text-white gap-1 px-2 py-1">
                                <Heart className="w-3 h-3 fill-accent text-accent" /> {submission.upvoteCount}
                             </Badge>
                         </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
