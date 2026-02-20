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
    const result = await suggestCaptionFlow({
      photoDataUri: validatedFields.data.photoDataUri,
    });
    return { caption: result.caption };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to suggest a caption. Please try again.' };
  }
}
