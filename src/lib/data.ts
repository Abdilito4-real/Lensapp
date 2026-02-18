import type { User, Challenge, Submission, Badge } from '@/lib/definitions';
import { Flame, Star, Award, Zap, Trophy } from 'lucide-react';

export const users: User[] = [
  { id: 'user-1', name: 'Alex', avatarId: 'user-avatar-1', streak: 12, totalUpvotes: 124, wins: ['submission-1', 'win-1'] },
  { id: 'user-2', name: 'Bri', avatarId: 'user-avatar-2', streak: 8, totalUpvotes: 89, wins: ['win-2'] },
  { id: 'user-3', name: 'Casey', avatarId: 'user-avatar-3', streak: 25, totalUpvotes: 345, wins: ['win-3', 'submission-3'] },
  { id: 'user-4', name: 'Drew', avatarId: 'user-avatar-4', streak: 2, totalUpvotes: 15, wins: [] },
  { id: 'user-5', name: 'Eli', avatarId: 'user-avatar-5', streak: 18, totalUpvotes: 210, wins: ['submission-5'] },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(8, 0, 0, 0);

export const currentChallenge: Challenge = {
  id: 'challenge-1',
  topic: 'Urban Geometry',
  description: 'Capture the hidden shapes, lines, and patterns within the city\'s architecture.',
  date: tomorrow.toISOString(),
};

export const submissions: Submission[] = [
  { id: 'submission-1', userId: 'user-1', challengeId: 'challenge-0', imageId: 'submission-1', upvotes: 42, timestamp: '2023-10-26T10:00:00Z' },
  { id: 'submission-2', userId: 'user-2', challengeId: 'challenge-0', imageId: 'submission-2', upvotes: 35, timestamp: '2023-10-26T11:00:00Z' },
  { id: 'submission-3', userId: 'user-3', challengeId: 'challenge-0', imageId: 'submission-3', upvotes: 68, timestamp: '2023-10-26T12:00:00Z' },
  { id: 'submission-4', userId: 'user-4', challengeId: 'challenge-0', imageId: 'submission-4', upvotes: 12, timestamp: '2023-10-26T13:00:00Z' },
  { id: 'submission-5', userId: 'user-5', challengeId: 'challenge-0', imageId: 'submission-5', upvotes: 55, timestamp: '2023-10-26T14:00:00Z' },
  { id: 'submission-6', userId: 'user-1', challengeId: 'challenge-0', imageId: 'submission-6', upvotes: 23, timestamp: '2023-10-26T15:00:00Z' },
];

export const winningSubmissions: Submission[] = [
    { id: 'win-1', userId: 'user-1', challengeId: 'challenge-prev-1', imageId: 'win-1', upvotes: 150, timestamp: '2023-10-25T10:00:00Z' },
    { id: 'win-2', userId: 'user-2', challengeId: 'challenge-prev-2', imageId: 'win-2', upvotes: 135, timestamp: '2023-10-24T11:00:00Z' },
    { id: 'win-3', userId: 'user-3', challengeId: 'challenge-prev-3', imageId: 'win-3', upvotes: 188, timestamp: '2023-10-23T12:00:00Z' },
]

export const badges: Badge[] = [
  { id: 'badge-1', title: '5-Day Streak', description: 'Submitted a photo 5 days in a row.', icon: Flame },
  { id: 'badge-2', title: 'First Win', description: 'Achieved your first daily challenge win.', icon: Trophy },
  { id: 'badge-3', title: 'Hot Streak', description: 'Submitted a photo 10 days in a row.', icon: Zap },
  { id: 'badge-4', title: 'Voter', description: 'Voted on 50 photos.', icon: Star },
  { id: 'badge-5', title: 'Dominator', description: 'Won 5 daily challenges.', icon: Award },
];

export function findUserById(userId: string): User | undefined {
    return users.find(user => user.id === userId);
}

export function findSubmissionById(submissionId: string): Submission | undefined {
    return [...submissions, ...winningSubmissions].find(sub => sub.id === submissionId);
}
