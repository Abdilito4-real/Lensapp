'use server';
/**
 * @fileOverview An AI agent for moderating photos against a daily challenge topic.
 *   This file defines a Genkit flow that takes a photo and a daily challenge topic,
 *   and determines if the photo aligns with the topic, providing a reason for its conclusion.
 *
 * - aiPhotoModeration - A function that handles the photo moderation process.
 * - AiPhotoModerationInput - The input type for the aiPhotoModeration function.
 * - AiPhotoModerationOutput - The return type for the aiPhotoModeration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPhotoModerationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo submitted by a user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  dailyChallengeTopic: z
    .string()
    .describe('The daily challenge topic that the photo should align with.'),
});
export type AiPhotoModerationInput = z.infer<
  typeof AiPhotoModerationInputSchema
>;

const AiPhotoModerationOutputSchema = z.object({
  alignsWithTopic: z
    .boolean()
    .describe(
      'True if the photo clearly aligns with the daily challenge topic, false otherwise.'
    ),
  reason: z
    .string()
    .describe(
      'A concise explanation of why the photo aligns or does not align with the daily challenge topic.'
    ),
});
export type AiPhotoModerationOutput = z.infer<
  typeof AiPhotoModerationOutputSchema
>;

export async function aiPhotoModeration(
  input: AiPhotoModerationInput
): Promise<AiPhotoModerationOutput> {
  return aiPhotoModerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPhotoModerationPrompt',
  input: {schema: AiPhotoModerationInputSchema},
  output: {schema: AiPhotoModerationOutputSchema},
  prompt: `You are an expert photo moderator for a daily photo challenge app.
Your task is to analyze a submitted photo and determine if it aligns with the given daily challenge topic.

Carefully examine the photo and compare its content, theme, and composition against the 'dailyChallengeTopic'.

If the photo clearly aligns with the topic, set 'alignsWithTopic' to true and provide a brief reason.
If the photo does not clearly align or is completely unrelated to the topic, set 'alignsWithTopic' to false and explain why it doesn't align.

Daily Challenge Topic: {{{dailyChallengeTopic}}}
Photo: {{media url=photoDataUri}}`,
});

const aiPhotoModerationFlow = ai.defineFlow(
  {
    name: 'aiPhotoModerationFlow',
    inputSchema: AiPhotoModerationInputSchema,
    outputSchema: AiPhotoModerationOutputSchema,
  },
  async input => {
    try {
      console.log('Running aiPhotoModerationFlow...');
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('AI returned an empty output for photo moderation.');
      }
      return output;
    } catch (error: any) {
      console.error('Error in aiPhotoModerationFlow:', error);
      throw error;
    }
  }
);
