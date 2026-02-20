'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, PlusSquare, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/snap-notes', label: 'Study', icon: BookOpen },
  { href: '/submit', label: 'Submit', icon: PlusSquare, className: "text-primary-foreground bg-primary rounded-lg p-3 h-auto w-auto shadow-lg hover:bg-primary/90" },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User, requiresAuth: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-t">
      <div className="container flex items-center justify-around h-16">
        {navItems.map((item) => {
          if(item.requiresAuth && !isAuthenticated) return null;
          
          const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors',
                isActive && 'text-primary',
                item.className
              )}
            >
              <item.icon className={cn('h-6 w-6', item.href === '/submit' ? 'h-7 w-7' : '')} />
              <span className={cn('text-xs mt-1', item.href === '/submit' ? 'hidden' : '')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
