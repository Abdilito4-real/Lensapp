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
import { Search, UserPlus, Send, Check, X, LogIn, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityPage() {
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
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-[50vh]">
                 <LogIn className="w-16 h-16 text-muted-foreground" />
                 <h2 className="text-2xl font-bold">Please Log In</h2>
                 <p className="text-muted-foreground">Log in to find friends and manage your connections.</p>
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
