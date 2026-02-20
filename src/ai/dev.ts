'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-photo-moderation.ts';
import '@/ai/flows/snap-notes-flow.ts';
