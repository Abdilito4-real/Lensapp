import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { users, submissions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Flame, Heart } from 'lucide-react';
import { findUserById } from '@/lib/data';

export default function LeaderboardPage() {
    const topStreaks = [...users].sort((a, b) => b.streak - a.streak);
    const topSubmissions = [...submissions].sort((a, b) => b.upvotes - a.upvotes);

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
                        {topStreaks.map((user, index) => {
                            const avatar = PlaceHolderImages.find(p => p.id === user.avatarId);
                            return (
                                <Card key={user.id}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold w-6 text-center text-muted-foreground">{index + 1}</span>
                                            <Avatar>
                                                <AvatarImage src={avatar?.imageUrl} alt={user.name} />
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{user.name}</span>
                                        </div>
                                        <Badge variant="secondary" className="gap-1.5 pl-2">
                                            <Flame className="h-4 w-4 text-accent" />
                                            {user.streak} days
                                        </Badge>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>
                <TabsContent value="submissions" className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {topSubmissions.map((submission, index) => {
                            const image = PlaceHolderImages.find(p => p.id === submission.imageId);
                            const user = findUserById(submission.userId);
                            const avatar = user ? PlaceHolderImages.find(p => p.id === user.avatarId) : undefined;
                            return (
                                <Card key={submission.id} className="overflow-hidden group">
                                    <CardContent className="p-0 relative">
                                        <div className="absolute top-2 left-2 z-10 bg-black/50 text-white h-8 w-8 rounded-full flex items-center justify-center font-bold text-lg">{index + 1}</div>
                                        <div className="relative aspect-[4/3]">
                                            {image && (
                                                <Image src={image.imageUrl} alt="Top submission" fill sizes="(max-width: 640px) 90vw, 45vw" className="object-cover" data-ai-hint={image.imageHint} />
                                            )}
                                        </div>
                                        <div className="p-4 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {user && avatar &&
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={avatar.imageUrl} alt={user.name} />
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                }
                                                <span className="text-sm font-medium">{user?.name || 'Anonymous'}</span>
                                            </div>
                                            <Badge variant="outline" className="gap-1.5">
                                                <Heart className="h-3.5 w-3.5 text-accent fill-current" />
                                                {submission.upvotes}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
