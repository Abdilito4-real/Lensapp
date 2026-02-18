import Image from 'next/image';
import { cn } from '@/lib/utils';

export function LensLoader({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Loading..."
      width={20}
      height={20}
      className={cn('animate-spin', className)}
    />
  );
}
