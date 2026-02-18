'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Vote, PlusSquare, Trophy, User } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/vote', label: 'Vote', icon: Vote },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User, requiresAuth: true },
];

export function DesktopNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <aside className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <TooltipProvider>
            <nav className="flex flex-col items-center gap-2 p-2 rounded-full border bg-background/80 backdrop-blur-sm shadow-md">
                {navItems.map((item) => {
                    if (item.requiresAuth && !isAuthenticated) return null;
                    
                    const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));

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
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                         <Button asChild size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link href="/submit">
                                <PlusSquare className="h-5 w-5" />
                                <span className="sr-only">Submit</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        <p>Submit Photo</p>
                    </TooltipContent>
                </Tooltip>
            </nav>
        </TooltipProvider>
    </aside>
  );
}
