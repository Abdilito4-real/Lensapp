'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/friends', label: 'Friends' },
  { href: '/leaderboard', label: 'Leaderboard' },
];

export function MainNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm">
      {navItems.map((item) => {
        const isActive = (item.href === '/' && pathname === '/') || (item.href !== '/' && pathname.startsWith(item.href));
        if (item.href === '/friends' && !isAuthenticated) return null;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'font-medium text-muted-foreground transition-colors hover:text-primary',
              isActive && 'text-primary'
            )}
          >
            {item.label}
          </Link>
        );
      })}
      {isAuthenticated && (
        <Link
          href="/profile"
          className={cn(
            'font-medium text-muted-foreground transition-colors hover:text-primary',
            pathname.startsWith('/profile') && 'text-primary'
          )}
        >
          Profile
        </Link>
      )}
    </nav>
  );
}
