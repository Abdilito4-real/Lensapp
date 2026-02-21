'use client';

import { useState } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useFirebaseApp, updateDocumentNonBlocking } from '@/firebase';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { badges, findSubmissionById } from '@/lib/data';
import { Flame, Heart, Trophy, LogIn, Wand2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { UserProfile } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { generateAvatarAction } from '@/lib/avatar-actions';

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const firebaseApp = useFirebaseApp();
    const { toast } = useToast();

    const [isGenerating, setIsGenerating] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isPromptDialogOpen, setIsPromptDialogOpen] = useState(false);

    const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'userProfiles', user.uid) : null, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    // TODO: Replace with firestore data
    const userWins = (userProfile?.totalWins > 0) ? (findSubmissionById('win-1') ? [findSubmissionById('win-1')] : []) : [];
    
    const handleGenerateAvatar = async () => {
        if (!prompt || !user || !firebaseApp || !userProfileRef) return;

        setIsPromptDialogOpen(false);
        setIsGenerating(true);
        toast({ title: 'Generating your new avatar...', description: 'This may take a moment.' });

        try {
            const result = await generateAvatarAction(prompt);
            if (result.error || !result.imageDataUri) {
                throw new Error(result.error || 'Failed to generate image data.');
            }
            
            const storage = getStorage(firebaseApp);
            const storageRef = ref(storage, `avatars/${user.uid}.png`);
            
            await uploadString(storageRef, result.imageDataUri, 'data_url');
            
            const downloadURL = await getDownloadURL(storageRef);
            
            updateDocumentNonBlocking(userProfileRef, {
                profileImageUrl: downloadURL,
                updatedAt: serverTimestamp()
            });

            toast({ title: 'Avatar Updated!', description: 'Your new AI-generated avatar is now active.' });

        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: e.message || 'Could not generate or save the new avatar.',
            });
        } finally {
            setIsGenerating(false);
            setPrompt('');
        }
    }
    
    if (isUserLoading || (user && isProfileLoading)) {
      return (
         <div className="space-y-8">
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="flex gap-4 sm:gap-8 pt-4 sm:pt-0">
                         <Skeleton className="h-12 w-20" />
                         <Skeleton className="h-12 w-20" />
                         <Skeleton className="h-12 w-20" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-10 w-full" /></CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Hall of Fame</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-40 w-full" /></CardContent>
            </Card>
        </div>
      )
    }
    
    if (!user || !userProfile) {
        return (
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-[50vh]">
                 <LogIn className="w-16 h-16 text-muted-foreground" />
                 <h2 className="text-2xl font-bold">Please Log In</h2>
                 <p className="text-muted-foreground">Log in to view your profile, streaks, and awards.</p>
            </div>
        )
    }

    return (
        <>
        <div className="space-y-8">
            <Card>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative group">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={userProfile.profileImageUrl} alt={userProfile.displayName} key={userProfile.profileImageUrl} />
                            <AvatarFallback className="text-3xl">{userProfile.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button
                            onClick={() => {
                                setPrompt(userProfile.displayName);
                                setIsPromptDialogOpen(true);
                            }}
                            disabled={isGenerating}
                            variant="ghost"
                            className="absolute inset-0 size-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-white"
                        >
                            {isGenerating ? <Loader2 className="h-8 w-8 animate-spin"/> : <Wand2 className="h-8 w-8"/>}
                        </Button>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-bold">{userProfile.displayName}</h1>
                        <p className="text-muted-foreground">@{userProfile.displayName.toLowerCase().replace(' ', '')}</p>
                    </div>
                    <div className="flex gap-4 sm:gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-border pl-0 sm:pl-8 mt-4 sm:mt-0 w-full sm:w-auto justify-center">
                        <div className="text-center">
                            <p className="text-2xl font-bold flex items-center gap-1"><Flame className="h-6 w-6 text-orange-400" /> {userProfile.currentStreak}</p>
                            <p className="text-sm text-muted-foreground">Streak</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold flex items-center gap-1"><Heart className="h-6 w-6 text-red-400" /> {userProfile.totalUpvotesReceived}</p>
                            <p className="text-sm text-muted-foreground">Upvotes</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold flex items-center gap-1"><Trophy className="h-6 w-6 text-yellow-400" /> {userProfile.totalWins}</p>
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
                                            <span className="font-medium">{badge.name}</span>
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
                                const image = win ? PlaceHolderImages.find(p => p.id === win.photoUrl) : undefined;
                                if (!image || !win) return null;
                                return (
                                    <div key={win.id} className="rounded-lg overflow-hidden relative group aspect-square">
                                        <Image src={image.imageUrl} alt="Winning submission" fill sizes="(max-width: 768px) 45vw, (max-width: 1024px) 30vw, 22vw" className="object-cover" data-ai-hint={image.imageHint} />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                            <p className="text-white text-center text-xs">+{win.upvoteCount} votes</p>
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
        <AlertDialog open={isPromptDialogOpen} onOpenChange={setIsPromptDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Generate AI Avatar</AlertDialogTitle>
                    <AlertDialogDescription>
                        Describe the avatar you want to create. Start with your display name or get creative!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A happy robot with a baseball cap"
                />
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleGenerateAvatar}>Generate</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </>
    );
}
