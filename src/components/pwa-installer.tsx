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
    <div className="fixed bottom-20 right-4 z-50 animate-in fade-in slide-in-from-bottom-5 md:bottom-4">
      <Button onClick={handleInstallClick}>
        <Download className="mr-2 h-4 w-4" />
        Install App
      </Button>
    </div>
  );
}
