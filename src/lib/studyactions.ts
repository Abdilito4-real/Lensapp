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

    console.log(`Server Action: generateStudyTools called for action: ${action}`);
    const result = await createStudyTools({
      photoDataUris: photoDataUris,
      action: action,
    });
    console.log(`Server Action: generateStudyTools success for action: ${action}`);

    return {
      result: result,
      timestamp: Date.now(), // to force re-render
    };
  } catch (e: any) {
    console.error('Error in generateStudyTools server action:', e);
    const errorMessage = e.message || 'An unknown error occurred during AI study tool generation';
    return { error: `AI Error: ${errorMessage}. Please try again.` };
  }
}
