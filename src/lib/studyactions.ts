'use server';

import { createStudyTools, type SnapNotesOutput } from '@/ai/flows/snap-notes-flow';
import { z } from 'zod';

const studyActionSchema = z.object({
  photo: z.any(),
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

  const photo = formData.get('photo') as File;
  const action = formData.get('action') as 'summarize' | 'flashcards' | 'quiz';

  if (!photo || !action || typeof photo.arrayBuffer !== 'function' ) {
    return { error: 'A photo and an action are required.' };
  }

  try {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const photoDataUri = toDataURI(buffer, photo.type);

    const result = await createStudyTools({
      photoDataUri: photoDataUri,
      action: action,
    });

    return {
      result: result,
      timestamp: Date.now(), // to force re-render
    };
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate study tools. The AI model may be overloaded or the image could not be processed. Please try again.' };
  }
}
