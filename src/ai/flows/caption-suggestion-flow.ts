'use server';
/**
 * @fileOverview An AI agent for suggesting photo captions.
 *
 * - suggestCaption - A function that suggests a caption for a photo.
 * - SuggestCaptionInput - The input type for the suggestCaption function.
 * - SuggestCaptionOutput - The return type for the suggestCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCaptionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestCaptionInput = z.infer<typeof SuggestCaptionInputSchema>;

const SuggestCaptionOutputSchema = z.object({
  caption: z
    .string()
    .describe('A short, engaging caption for the photo.'),
});
export type SuggestCaptionOutput = z.infer<typeof SuggestCaptionOutputSchema>;

export async function suggestCaption(
  input: SuggestCaptionInput
): Promise<SuggestCaptionOutput> {
  return suggestCaptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCaptionPrompt',
  input: {schema: SuggestCaptionInputSchema},
  output: {schema: SuggestCaptionOutputSchema},
  prompt: `You are a creative assistant for a photo challenge app. Your task is to write a short, engaging, and creative caption for the following photo. The caption should be suitable for a social media style post. Keep it concise (1-2 sentences).

Photo: {{media url=photoDataUri}}`,
});

const suggestCaptionFlow = ai.defineFlow(
  {
    name: 'suggestCaptionFlow',
    inputSchema: SuggestCaptionInputSchema,
    outputSchema: SuggestCaptionOutputSchema,
  },
  async input => {
    try {
      console.log('Running suggestCaptionFlow...');
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('AI returned an empty output for caption suggestion.');
      }
      console.log('suggestCaptionFlow completed successfully.');
      return output;
    } catch (error) {
      console.error('Error in suggestCaptionFlow:', error);
      throw error;
    }
  }
);
