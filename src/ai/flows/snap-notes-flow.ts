'use server';
/**
 * @fileOverview An AI agent for creating study materials from photos.
 *
 * - createStudyTools - A function that handles the study tool creation process.
 * - SnapNotesInput - The input type for the createStudyTools function.
 * - SnapNotesOutput - The return type for the createStudyTools function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SnapNotesInputSchema = z.object({
  photoDataUris: z
    .array(z.string())
    .describe(
      "An array of photos of notes, textbooks, or slides, as data URIs. Each must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  action: z
    .enum(['summarize', 'flashcards', 'quiz'])
    .describe('The desired study tool to generate.'),
});
export type SnapNotesInput = z.infer<typeof SnapNotesInputSchema>;

const FlashcardSchema = z.object({
  front: z
    .string()
    .describe("The 'question' or term on the front of the flashcard."),
  back: z
    .string()
    .describe("The 'answer' or definition on the back of the flashcard."),
});

const QuizQuestionSchema = z.object({
  question: z.string().describe('The multiple-choice question.'),
  options: z.array(z.string()).describe('An array of 4 possible answers.'),
  answer: z.string().describe('The correct answer from the options.'),
});

const SnapNotesOutputSchema = z.object({
  summary: z
    .string()
    .optional()
    .describe('A concise summary of the key points from the provided text.'),
  flashcards: z
    .array(FlashcardSchema)
    .optional()
    .describe(
      'A list of flashcards with front and back content.'
    ),
  quiz: z
    .array(QuizQuestionSchema)
    .optional()
    .describe('A list of multiple-choice quiz questions.'),
});
export type SnapNotesOutput = z.infer<typeof SnapNotesOutputSchema>;

export async function createStudyTools(
  input: SnapNotesInput
): Promise<SnapNotesOutput> {
  return snapNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'snapNotesPrompt',
  input: {schema: SnapNotesInputSchema},
  output: {schema: SnapNotesOutputSchema},
  prompt: `You are an expert academic assistant. Your task is to analyze the provided image(s) of study material and generate a specific type of study tool based on the user's request.

Analyze the text content from all the images provided. Consolidate the information from all images before generating the output.

The user has requested the action: {{{action}}}

- If 'action' is 'summarize', provide a concise summary of the key concepts and main points in the 'summary' field.
- If 'action' is 'flashcards', identify key terms and definitions or questions and answers, and format them as an array of flashcards in the 'flashcards' field. Aim for 5-10 key flashcards based on the combined content.
- If 'action' is 'quiz', create a multiple-choice quiz with 3-5 questions based on the material. Each question should have 4 options and a correct answer. Populate the 'quiz' field.

Only populate the field corresponding to the requested action.

Images with study material:
{{#each photoDataUris}}
--- Image ---
{{media url=this}}
{{/each}}
`,
});

const snapNotesFlow = ai.defineFlow(
  {
    name: 'snapNotesFlow',
    inputSchema: SnapNotesInputSchema,
    outputSchema: SnapNotesOutputSchema,
  },
  async input => {
    try {
      console.log(`Running snapNotesFlow with action: ${input.action}...`);
      const {output} = await prompt(input);
      if (!output) {
        throw new Error(`AI returned an empty output for snapNotesFlow (${input.action}).`);
      }
      console.log('snapNotesFlow completed successfully.');
      return output;
    } catch (error) {
      console.error('Error in snapNotesFlow:', error);
      throw error;
    }
  }
);
