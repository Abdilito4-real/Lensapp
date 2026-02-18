import Link from 'next/link';
import { AuthButton } from '@/components/auth-button';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Lens logo" width={32} height={32} />
          <span className="font-bold text-lg">Lens</span>
        </Link>
        <AuthButton />
      </div>
    </header>
  );
}
