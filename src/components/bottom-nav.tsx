'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, BookOpen, User, Users, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

const navItems = [
  { href: '/community', label: 'Community', icon: Users },
  { href: '/snap-notes', label: 'Study', icon: BookOpen },
  { href: '/submit', label: 'Submit', icon: Camera },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User, requiresAuth: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const isAuthenticated = !!user;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-t">
      <div className="container flex items-center justify-around h-16">
        {navItems.map((item) => {
          if(item.requiresAuth && !isAuthenticated) return null;
          
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors',
                isActive && 'text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
