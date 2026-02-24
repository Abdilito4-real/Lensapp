'use server';

import { aiPhotoModeration } from '@/ai/flows/ai-photo-moderation';
import { z } from 'zod';

const photoSchema = z.object({
  photo: z.any(),
  topic: z.string(),
});

type ModerationState = {
  alignsWithTopic?: boolean;
  reason?: string;
  error?: string;
};

function toDataURI(buffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

export async function moderatePhoto(
  prevState: ModerationState,
  formData: FormData
): Promise<ModerationState> {
  const validatedFields = photoSchema.safeParse({
    photo: formData.get('photo'),
    topic: formData.get('topic'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid data provided.',
    };
  }

  const { photo, topic } = validatedFields.data;

  if (!photo || typeof photo.arrayBuffer !== 'function' || !topic) {
    return { error: 'Photo and topic are required.' };
  }

  try {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const photoDataUri = toDataURI(buffer, photo.type);

    console.log('Server Action: moderatePhoto called');
    const result = await aiPhotoModeration({
      photoDataUri: photoDataUri,
      dailyChallengeTopic: topic,
    });
    console.log('Server Action: moderatePhoto success');

    return {
      alignsWithTopic: result.alignsWithTopic,
      reason: result.reason,
    };
  } catch (e: any) {
    console.error('Error in moderatePhoto server action:', e);
    const errorMessage = e.message || 'An unknown error occurred during AI moderation';
    return { error: `Failed to moderate photo: ${errorMessage}` };
  }
}
