'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PwaInstaller() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => console.log('Service Worker registered with scope:', registration.scope))
          .catch((error) => console.error('Service Worker registration failed:', error));
      });
    }

    // Capture install prompt
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        toast({
          title: 'Installation successful!',
          description: 'Lens has been added to your home screen.',
        });
      } else {
         toast({
          title: 'Installation dismissed',
          description: 'You can install the app later from the browser menu.',
        });
      }
      setInstallPrompt(null);
    });
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-[100] animate-in fade-in slide-in-from-bottom-5 md:bottom-8 md:right-8">
      <Button
        onClick={handleInstallClick}
        className="rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-6 h-auto font-bold flex items-center gap-2 border-2 border-background/20 backdrop-blur-sm"
      >
        <div className="bg-background/20 p-1.5 rounded-full">
          <Download className="h-5 w-5" />
        </div>
        <span>Install Lens App</span>
      </Button>
    </div>
  );
}
