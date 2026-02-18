import Link from 'next/link';
import { AuthButton } from '@/components/auth-button';
import Image from 'next/image';
import { MainNav } from './main-nav';
import { Button } from './ui/button';
import { PlusSquare } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="Lens logo" width={48} height={48} />
                <span className="font-bold text-xl">Lens</span>
            </Link>
            <MainNav />
        </div>
        <div className="flex items-center gap-4">
            <Button asChild className="hidden md:flex">
                <Link href="/submit">
                    <PlusSquare className="mr-2 h-4 w-4" />
                    Submit
                </Link>
            </Button>
            <AuthButton />
        </div>
      </div>
    </header>
  );
}
