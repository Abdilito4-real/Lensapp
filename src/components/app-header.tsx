import Link from 'next/link';
import { AuthButton } from '@/components/auth-button';
import Image from 'next/image';

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="Lens logo" width={48} height={48} className="w-12 h-12" />
                <span className="font-bold text-xl">Lens</span>
            </Link>
        </div>
        <div className="flex items-center gap-4">
            <AuthButton />
        </div>
      </div>
    </header>
  );
}
