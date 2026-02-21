'use server';

import { createStudyTools, type SnapNotesOutput } from '@/ai/flows/snap-notes-flow';
import { z } from 'zod';

const studyActionSchema = z.object({
  photos: z.array(z.any()),
  action: z.enum(['summarize', 'flashcards', 'quiz']),
});

type StudyState = {
  result?: SnapNotesOutput;
  error?: string;
  timestamp?: number;
};

function toDataURI(buffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function generateStudyTools(
  prevState: StudyState,
  formData: FormData
): Promise<StudyState> {

  const photos = formData.getAll('photo') as File[];
  const action = formData.get('action') as 'summarize' | 'flashcards' | 'quiz';

  if (!photos || photos.length === 0 || !action) {
    return { error: 'At least one photo and an action are required.' };
  }

  try {
    const photoDataUris = await Promise.all(
        photos.map(async (photo) => {
            if (typeof photo.arrayBuffer !== 'function') {
                throw new Error('Invalid file type in photos.');
            }
            const buffer = Buffer.from(await photo.arrayBuffer());
            return toDataURI(buffer, photo.type);
        })
    );

    const result = await createStudyTools({
      photoDataUris: photoDataUris,
      action: action,
    });

    return {
      result: result,
      timestamp: Date.now(), // to force re-render
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `Failed to generate study tools: ${errorMessage}. The AI model may be overloaded or the image could not be processed. Please try again.` };
  }
}
