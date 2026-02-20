'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { users, findUserById } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Search, UserPlus, Send, Check, X, LogIn, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function HomePage() {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-[50vh]">
                 <LogIn className="w-16 h-16 text-muted-foreground" />
                 <h2 className="text-2xl font-bold">Please Log In</h2>
                 <p className="text-muted-foreground">Log in to find friends and manage your connections.</p>
            </div>
        )
    }

    // Mock data filtering
    const currentUser = findUserById(user.id);
    const friendRequests = currentUser?.friendRequests.map(findUserById).filter(Boolean) || [];
    const friends = currentUser?.friends.map(findUserById).filter(Boolean) || [];
    
    const allUserIds = new Set([user.id, ...currentUser?.friends || [], ...currentUser?.friendRequests || []]);
    const newUsers = users.filter(u => !allUserIds.has(u.id)).slice(0, 5);
    
    const searchResults = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        searchTerm &&
        u.id !== user.id
    );

    const handleSendStreak = (friendName: string) => {
        toast({
            title: `Streak Sent!`,
            description: `You've sent a streak reminder to ${friendName}.`,
        });
    };

    const handleAddFriend = (newFriendName: string) => {
         toast({
            title: `Friend Request Sent!`,
            description: `Your friend request to ${newFriendName} has been sent.`,
        });
    }

    const handleRequest = (requestorName: string, accept: boolean) => {
        toast({
            title: `Request ${accept ? 'Accepted' : 'Declined'}`,
            description: `You have ${accept ? 'accepted' : 'declined'} the friend request from ${requestorName}.`,
        });
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
                            {searchResults.length > 0 ? searchResults.map(foundUser => {
                                const avatar = PlaceHolderImages.find(p => p.id === foundUser.avatarId);
                                return (
                                    <div key={foundUser.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={avatar?.imageUrl} alt={foundUser.name} />
                                                <AvatarFallback>{foundUser.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{foundUser.name}</span>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleAddFriend(foundUser.name)}>
                                            <UserPlus className="mr-2 h-4 w-4" /> Add
                                        </Button>
                                    </div>
                                )
                            }) : <p className="text-sm text-muted-foreground text-center pt-2">No users found.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>

            {friendRequests.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Friend Requests</CardTitle>
                        <CardDescription>You have {friendRequests.length} new friend request{friendRequests.length > 1 ? 's' : ''}.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {friendRequests.map(requestor => {
                            const avatar = PlaceHolderImages.find(p => p.id === requestor.avatarId);
                            return (
                                <div key={requestor.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={avatar?.imageUrl} alt={requestor.name} />
                                            <AvatarFallback>{requestor.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{requestor.name} wants to be your friend.</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="outline" onClick={() => handleRequest(requestor.name, false)}><X className="h-4 w-4"/></Button>
                                        <Button size="icon" onClick={() => handleRequest(requestor.name, true)}><Check className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>My Friends</CardTitle>
                    <CardDescription>Send streaks to your friends to keep them motivated.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {friends.length > 0 ? friends.map(friend => {
                        const avatar = PlaceHolderImages.find(p => p.id === friend.avatarId);
                        return (
                            <div key={friend.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={avatar?.imageUrl} alt={friend.name} />
                                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{friend.name}</span>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleSendStreak(friend.name)}>
                                    <Send className="mr-2 h-4 w-4" /> Send Streak
                                </Button>
                            </div>
                        )
                    }) : <p className="text-sm text-muted-foreground text-center py-4">You haven't added any friends yet.</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Discover New People</CardTitle>
                    <CardDescription>Connect with other users on Lens.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {newUsers.map(newUser => {
                        const avatar = PlaceHolderImages.find(p => p.id === newUser.avatarId);
                        return (
                            <div key={newUser.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={avatar?.imageUrl} alt={newUser.name} />
                                        <AvatarFallback>{newUser.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{newUser.name}</span>
                                </div>
                                <Button size="sm" onClick={() => handleAddFriend(newUser.name)}>
                                    <UserPlus className="mr-2 h-4 w-4" /> Add Friend
                                </Button>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
