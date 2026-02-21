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
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during image generation.';
    return { error: errorMessage };
  }
}
