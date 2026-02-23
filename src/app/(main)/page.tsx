'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page exists to resolve a routing conflict.
// It redirects any traffic aimed at the root of the '(main)' group to the correct '/community' page.
export default function MainRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/community');
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
