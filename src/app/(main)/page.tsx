'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { UserProfile } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Search, UserPlus, Send, Check, X, LogIn, Users, Camera, Trophy, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function HomePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const userProfilesCollection = useMemoFirebase(() =>
        (firestore && user) ? collection(firestore, 'userProfiles') : null,
        [firestore, user]
    );
    const { data: userProfiles, isLoading: areProfilesLoading } = useCollection<UserProfile>(userProfilesCollection);

    const handleSendStreak = (friendName: string) => {
        toast({
            title: `Feature Coming Soon!`,
            description: `Sending streaks to friends is not yet implemented.`,
        });
    };

    const handleAddFriend = (newFriendName: string) => {
         toast({
            title: `Feature Coming Soon!`,
            description: `Adding friends is not yet implemented.`,
        });
    }

    const handleRequest = (requestorName: string, accept: boolean) => {
        toast({
            title: `Feature Coming Soon!`,
            description: `Accepting/declining friend requests is not yet implemented.`,
        });
    }

    const searchResults = useMemo(() => {
        if (!searchTerm || !userProfiles) return [];
        return userProfiles.filter(u => 
            u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) && 
            u.id !== user?.uid
        );
    }, [searchTerm, userProfiles, user]);

    const discoverUsers = useMemo(() => {
        if (!userProfiles || !user) return [];
        // Simple "discover" logic: show users who aren't the current user
        return userProfiles.filter(u => u.id !== user.uid).slice(0, 5);
    }, [userProfiles, user]);


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
        const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-'));

        return (
            <div className="space-y-16">
                <section className="relative h-[calc(100vh-80px)] min-h-[600px] flex flex-col items-center justify-center py-4 px-4 overflow-hidden">
                    <div className="relative z-20 text-center space-y-2 mb-4 md:mb-8">
                         <h1 className="text-white text-4xl md:text-7xl font-extrabold tracking-tighter animate-in fade-in slide-in-from-top-8 duration-1000">
                            Today's Challenge
                        </h1>
                        <p className="text-[#d9e5c5]/80 text-sm md:text-xl max-w-2xl mx-auto font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 px-4">
                            A new photo challenge every day. Submit your best shot.
                        </p>
                    </div>

                    <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[500px]">
                         {/* Overlapping Images (Background Layer) */}
                         <div className="absolute -top-10 -left-10 md:-left-28 w-48 md:w-64 h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl transform -rotate-12 transition-all hover:rotate-0 hover:scale-105 duration-500 z-0 hidden md:block">
                             <Image
                                src={galleryImages[0]?.imageUrl || PlaceHolderImages[0].imageUrl}
                                alt="Challenge Sample 1"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 40vw, 300px"
                             />
                         </div>

                         <div className="absolute top-2 -right-10 md:-right-28 w-56 md:w-72 h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl transform rotate-12 transition-all hover:rotate-0 hover:scale-105 duration-500 z-0 hidden md:block">
                             <Image
                                src={galleryImages[1]?.imageUrl || PlaceHolderImages[1].imageUrl}
                                alt="Challenge Sample 2"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 400px"
                             />
                         </div>

                         {/* The Challenge Card (Middle Layer) */}
                         <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                             <div className="bg-[#3d4a30] border border-white/10 rounded-[2.5rem] p-6 md:p-8 max-w-lg w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center space-y-6 pointer-events-auto transform transition-transform hover:scale-[1.02] duration-300">
                                 <div className="space-y-2">
                                     <h3 className="text-[#d9e5c5] text-2xl md:text-3xl font-bold">The Study Grind</h3>
                                     <p className="text-[#d9e5c5]/70 text-sm md:text-base leading-relaxed">Show us your study session setup. Late nights, coffee, and books!</p>
                                 </div>

                                 <div className="space-y-2">
                                     <p className="text-[#d9e5c5]/40 text-xs md:text-sm uppercase tracking-[0.2em] font-semibold">Challenge ends in:</p>
                                     <div className="text-[#d9e5c5] text-3xl md:text-5xl font-mono font-bold flex justify-center items-center gap-3 md:gap-4">
                                         <span className="bg-black/20 px-2 py-1 rounded-lg">00</span>
                                         <span className="opacity-50">:</span>
                                         <span className="bg-black/20 px-2 py-1 rounded-lg">00</span>
                                         <span className="opacity-50">:</span>
                                         <span className="bg-black/20 px-2 py-1 rounded-lg">00</span>
                                     </div>
                                 </div>

                                 <Button asChild className="w-full bg-[#d9e5c5] text-[#3d4a30] hover:bg-white hover:scale-105 rounded-2xl py-6 text-lg font-bold shadow-lg transition-all">
                                     <Link href="/login?redirectTo=/submit" className="flex items-center justify-center gap-3">
                                         Submit Your Photo <Send className="w-6 h-6" />
                                     </Link>
                                 </Button>
                             </div>
                         </div>

                         {/* Overlapping Images (Foreground Layer) */}
                         <div className="absolute -bottom-16 left-4 md:-left-10 w-52 md:w-64 h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl transform rotate-6 transition-all hover:rotate-0 hover:scale-110 duration-500 z-20 border-4 border-[#3d4a30] hidden md:block">
                             <Image
                                src={galleryImages[2]?.imageUrl || PlaceHolderImages[2].imageUrl}
                                alt="Challenge Sample 3"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 40vw, 300px"
                             />
                         </div>

                         <div className="absolute -bottom-10 right-4 md:right-0 w-48 md:w-60 h-64 md:h-72 rounded-2xl overflow-hidden shadow-2xl transform -rotate-6 transition-all hover:rotate-0 hover:scale-110 duration-500 z-20 border-4 border-[#3d4a30] hidden md:block">
                             <Image
                                src={galleryImages[3]?.imageUrl || PlaceHolderImages[3].imageUrl}
                                alt="Challenge Sample 4"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 40vw, 300px"
                             />
                         </div>
                    </div>
                </section>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <Camera className="w-12 h-12 text-primary mb-2" />
                            <CardTitle>Daily Challenges</CardTitle>
                            <CardDescription>Fresh inspiration every day to keep your creative juices flowing.</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <Trophy className="w-12 h-12 text-primary mb-2" />
                            <CardTitle>Vote & Streaks</CardTitle>
                            <CardDescription>Vote on the best daily photos and support users with the longest streaks.</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <BookOpen className="w-12 h-12 text-primary mb-2" />
                            <CardTitle>Snap Notes</CardTitle>
                            <CardDescription>AI-powered insights and captions for your photographic masterpieces.</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Community</h1>
                <p className="max-w-md mx-auto text-muted-foreground md:text-lg">
                    Find new friends, manage requests, and connect with other photographers.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Find Friends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <Input 
                            type="text" 
                            placeholder="Search by name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>
                    {searchTerm && (
                        <div className="mt-4 space-y-2">
                            {areProfilesLoading ? <Skeleton className="h-10 w-full" /> : 
                            searchResults.length > 0 ? searchResults.map(foundUser => {
                                return (
                                    <div key={foundUser.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={foundUser.profileImageUrl} alt={foundUser.displayName} />
                                                <AvatarFallback>{foundUser.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{foundUser.displayName}</span>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleAddFriend(foundUser.displayName)}>
                                            <UserPlus className="mr-2 h-4 w-4" /> Add
                                        </Button>
                                    </div>
                                )
                            }) : <p className="text-sm text-muted-foreground text-center pt-2">No users found.</p>}
                        </div>
                    )}
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
                        {areProfilesLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : discoverUsers && discoverUsers.length > 0 ? (
                            discoverUsers.map(newUser => {
                                return (
                                    <div key={newUser.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={newUser.profileImageUrl} alt={newUser.displayName} />
                                                <AvatarFallback>{newUser.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{newUser.displayName}</span>
                                        </div>
                                        <Button size="sm" onClick={() => handleAddFriend(newUser.displayName)}>
                                            <UserPlus className="mr-2 h-4 w-4" /> Add Friend
                                        </Button>
                                    </div>
                                )
                            })
                        ) : <p className="text-sm text-muted-foreground text-center py-4">No new users to discover right now.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
