'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, User, BookOpen, Users, Camera } from 'lucide-react';
import { useUser } from '@/firebase';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/community', label: 'Community', icon: Users },
  { href: '/snap-notes', label: 'Study', icon: BookOpen },
  { href: '/submit', label: 'Submit', icon: Camera },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User, requiresAuth: true },
];

export function DesktopNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAuthenticated = !!user;

  return (
    <aside className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-2 p-2 rounded-full border bg-background/80 backdrop-blur-sm shadow-md">
                {navItems.map((item) => {
                    if (item.requiresAuth && !isAuthenticated) return null;
                    
                    const isActive = pathname.startsWith(item.href);

                    return (
                        <Tooltip key={item.href} delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button asChild variant={isActive ? "secondary" : "ghost"} size="icon" className="rounded-full">
                                    <Link href={item.href}>
                                        <item.icon className="h-5 w-5" />
                                        <span className="sr-only">{item.label}</span>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                                <p>{item.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </nav>
        </TooltipProvider>
    </aside>
  );
}
