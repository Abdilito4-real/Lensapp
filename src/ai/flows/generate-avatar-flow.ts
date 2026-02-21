'use server';
/**
 * @fileOverview An AI agent for generating cartoon-style user avatars.
 *
 * - generateAvatar - A function that generates an avatar from a text prompt.
 * - GenerateAvatarInput - The input type for the generateAvatar function.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAvatarInputSchema = z.string();
export type GenerateAvatarInput = z.infer<typeof GenerateAvatarInputSchema>;

const GenerateAvatarOutputSchema = z.object({
  imageDataUri: z.string().describe('The generated avatar image as a data URI.'),
});
export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(
  prompt: GenerateAvatarInput
): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(prompt);
}

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: GenerateAvatarInputSchema,
    outputSchema: GenerateAvatarOutputSchema,
  },
  async prompt => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image',
      prompt: `Generate a cute, cartoon-style avatar based on the prompt: '${prompt}'. The avatar should be a single character, suitable as a profile picture. Use a simple, flat illustration style with vibrant colors on a clean, solid-color background. The image must be square.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        aspectRatio: '1:1',
      }
    });

    if (!media.url) {
        throw new Error('Image generation failed to return a data URI.');
    }

    return { imageDataUri: media.url };
  }
);
