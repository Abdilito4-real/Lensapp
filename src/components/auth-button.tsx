'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useState } from 'react';
import { users } from '@/lib/data';
import { LogOut, User as UserIcon, LogIn } from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function AuthButton() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const handleLogin = () => {
    // For this mock, we'll just log in the first user.
    login(users[0]);
    setIsLoginDialogOpen(false);
  };
  
  const userAvatar = PlaceHolderImages.find(p => p.id === user?.avatarId);

  if (isAuthenticated && user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userAvatar?.imageUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                @{user.name.toLowerCase()}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button onClick={() => setIsLoginDialogOpen(true)}>
        <LogIn className="mr-2 h-4 w-4" />
        Login
      </Button>
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Welcome to Lens</DialogTitle>
            <DialogDescription>
              Sign in to participate in daily challenges and vote for your favorite photos. This is a mock sign-in for demonstration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Button onClick={handleLogin} className="w-full" type="button">
              Sign In as Demo User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
