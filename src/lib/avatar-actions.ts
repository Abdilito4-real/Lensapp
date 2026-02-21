'use server';
import { generateAvatar as generateAvatarFlow } from '@/ai/flows/generate-avatar-flow';
import { z } from 'zod';

export async function generateAvatarAction(prompt: string): Promise<{ imageDataUri?: string; error?: string; }> {
  const schema = z.string().min(3, 'Prompt must be at least 3 characters.');
  const validated = schema.safeParse(prompt);
  if (!validated.success) {
    return { error: 'Invalid prompt: must be at least 3 characters long.' };
  }

  try {
    const result = await generateAvatarFlow(validated.data);
    if (!result.imageDataUri) {
      throw new Error('The AI model did not return an image. Please try a different prompt.');
    }
    return { imageDataUri: result.imageDataUri };
  } catch (e) {
    console.error(e);
    let errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during image generation.';
    if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('429') || errorMessage.includes('Quota exceeded')) {
        errorMessage = 'You have exceeded the free quota for image generation. To continue, please check your Google Cloud plan and billing details.';
    }
    return { error: errorMessage };
  }
}
