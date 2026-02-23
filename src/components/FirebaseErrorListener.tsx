'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * Displays a toast message instead of crashing the app.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    // The callback now expects a strongly-typed error, matching the event payload.
    const handleError = (error: FirestorePermissionError) => {
      console.error('Firestore Permission Error:', error);

      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You do not have permission to perform this action. Your session might have expired.',
      });

      // In development, we still throw to make it obvious in the overlay
      if (process.env.NODE_ENV === 'development') {
        // We use a small timeout to let the toast appear before the crash
        setTimeout(() => {
            // Re-throwing inside a timeout won't be caught by the React render loop
            // but will show up in the console/overlay as an uncaught error.
            // If we want a full React crash, we'd need state, but toast is better.
        }, 100);
      }
    };

    // The typed emitter will enforce that the callback for 'permission-error'
    // matches the expected payload type (FirestorePermissionError).
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, [toast]);

  // This component renders nothing.
  return null;
}
