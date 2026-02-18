'use client';

import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { badges, findSubmissionById } from '@/lib/data';
import { Flame, Heart, Trophy, LogIn } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuth();
    
    if (!isAuthenticated || !user) {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-[50vh]">
                 <LogIn className="w-16 h-16 text-muted-foreground" />
                 <h2 className="text-2xl font-bold">Please Log In</h2>
                 <p className="text-muted-foreground">Log in to view your profile, streaks, and awards.</p>
                 {/* The login button is in the header */}
            </div>
        )
    }
    
    const userAvatar = PlaceHolderImages.find(p => p.id === user.avatarId);
    const userWins = user.wins.map(findSubmissionById).filter(Boolean);

    return (
        <div className="space-y-8">
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={userAvatar?.imageUrl} alt={user.name}/>
                        <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold">{user.name}</h1>
                        <p className="text-muted-foreground">@{user.name.toLowerCase()}</p>
                    </div>
                    <div className="flex gap-4 sm:gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-border pl-0 sm:pl-8 mt-4 sm:mt-0 w-full sm:w-auto justify-center">
                        <div className="text-center">
                            <p className="text-2xl font-bold flex items-center gap-1"><Flame className="h-6 w-6 text-orange-400" /> {user.streak}</p>
                            <p className="text-sm text-muted-foreground">Streak</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold flex items-center gap-1"><Heart className="h-6 w-6 text-red-400" /> {user.totalUpvotes}</p>
                            <p className="text-sm text-muted-foreground">Upvotes</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold flex items-center gap-1"><Trophy className="h-6 w-6 text-yellow-400" /> {user.wins.length}</p>
                            <p className="text-sm text-muted-foreground">Wins</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Badges</CardTitle>
                    <CardDescription>Your collection of achievements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TooltipProvider>
                        <div className="flex flex-wrap gap-4">
                            {badges.map(badge => (
                                <Tooltip key={badge.id}>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className="p-3 gap-2 cursor-pointer">
                                            <badge.icon className="h-5 w-5" />
                                            <span className="font-medium">{badge.title}</span>
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{badge.description}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Hall of Fame</CardTitle>
                    <CardDescription>Your winning submissions.</CardDescription>
                </CardHeader>
                <CardContent>
                    {userWins.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {userWins.map(win => {
                                const image = win ? PlaceHolderImages.find(p => p.id === win.imageId) : undefined;
                                if (!image) return null;
                                return (
                                    <div key={win.id} className="rounded-lg overflow-hidden relative group aspect-w-1 aspect-h-1">
                                        <Image src={image.imageUrl} alt="Winning submission" layout="fill" objectFit="cover" data-ai-hint={image.imageHint} />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                            <p className="text-white text-center text-xs">+{win.upvotes} votes</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                         <p className="text-muted-foreground text-center py-8">No wins yet. Keep participating!</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
