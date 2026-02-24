'use server';
import { suggestCaption as suggestCaptionFlow } from '@/ai/flows/caption-suggestion-flow';
import { z } from 'zod';

const captionSchema = z.object({
  photoDataUri: z.string(),
});

export async function suggestCaption(
  photoDataUri: string
): Promise<{ caption?: string; error?: string; }> {
  const validatedFields = captionSchema.safeParse({ photoDataUri });
  if (!validatedFields.success) {
    return { error: 'Invalid data provided.' };
  }

  try {
    console.log('Server Action: suggestCaption called');
    const result = await suggestCaptionFlow({
      photoDataUri: validatedFields.data.photoDataUri,
    });
    console.log('Server Action: suggestCaption success');
    return { caption: result.caption };
  } catch (e: any) {
    console.error('Error in suggestCaption server action:', e);
    const errorMessage = e.message || 'An unknown error occurred during AI caption generation';
    return { error: errorMessage };
  }
}
