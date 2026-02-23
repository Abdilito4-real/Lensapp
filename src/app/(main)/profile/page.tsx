'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { badges, findSubmissionById } from '@/lib/data';
import { Flame, Heart, Trophy, LogIn, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { UserProfile } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ImageCropper } from '@/components/image-cropper';


export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);

    const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'userProfiles', user.uid) : null, [user, firestore]);
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    // TODO: Replace with firestore data
    const userWins = (userProfile && userProfile.totalWins > 0) ? (findSubmissionById('win-1') ? [findSubmissionById('win-1')] : []) : [];
    
    const handleAvatarClick = () => {
        if (isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleCropComplete = async (croppedImageSrc: string) => {
        if (!user || !userProfileRef) return;
        
        setImageToCrop(null);
        setIsUploading(true);
        toast({ title: 'Uploading your new avatar...', description: 'This may take a moment.' });

        try {
            const response = await fetch(croppedImageSrc);
            const blob = await response.blob();
            
            const formData = new FormData();
            formData.append('file', blob, 'avatar.png');

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || 'Upload to Cloudinary failed');
            }

            const { url: downloadURL } = await uploadResponse.json();
            
            updateDocumentNonBlocking(userProfileRef, {
                profileImageUrl: downloadURL,
                updatedAt: serverTimestamp()
            });

            toast({ title: 'Avatar Updated!', description: 'Your new avatar is now active.' });

        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: 'Upload Failed',
                description: e.message || 'Could not upload the new avatar.',
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
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
        // This should not be reached because the layout handles it, but it's a good fallback.
        return null;
    }

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
            />

            {imageToCrop && (
                <ImageCropper
                    imageSrc={imageToCrop}
                    onCropComplete={handleCropComplete}
                    onClose={() => setImageToCrop(null)}
                />
            )}
            <div className="space-y-8">
                <Card>
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={userProfile.profileImageUrl} alt={userProfile.displayName} key={userProfile.profileImageUrl} />
                                <AvatarFallback className="text-3xl">{userProfile.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <Button
                                onClick={handleAvatarClick}
                                disabled={isUploading}
                                variant="ghost"
                                className="absolute inset-0 size-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full text-white cursor-pointer"
                            >
                                {isUploading ? <Loader2 className="h-8 w-8 animate-spin"/> : <Camera className="h-8 w-8"/>}
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
      </>
    );
}
