import type { Challenge, Submission, Badge } from '@/lib/definitions';
import { Flame, Star, Award, Zap, Trophy } from 'lucide-react';

export const dailyChallenges: Omit<Challenge, 'id' | 'challengeDate' | 'submissionStartTime' | 'submissionEndTime' | 'votingStartTime' | 'votingEndTime' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Campus Landmarks',
    description: "Showcase an iconic spot on your campus.",
  },
  {
    title: 'Dorm Room Life',
    description: 'Capture the unique personality of your dorm room.',
  },
  {
    title: 'The Study Grind',
    description: 'Show us your study session setup. Late nights, coffee, and books!',
  },
  {
    title: 'School Spirit',
    description: "Feature your university's colors with pride.",
  },
  {
    title: 'Library Architecture',
    description: 'Find an interesting angle or detail in the campus library.',
  },
  {
    title: 'Cafeteria Gourmet',
    description: 'Make your campus meal look like a masterpiece.',
  },
  {
    title: 'Life in Motion',
    description: 'Capture the energy of students between classes or on the quad.',
  },
];

// Function to get the challenge for the current day
export function getTodaysChallenge() {
    const today = new Date();
    // This calculation gives us the day number of the year (e.g., Feb 1 is day 32).
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Use the modulo operator to cycle through the challenges array.
    const challengeIndex = dayOfYear % dailyChallenges.length;
    const challengeData = dailyChallenges[challengeIndex];

    // Set the end date for the challenge to 8 AM tomorrow.
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    return {
        id: `challenge-${dayOfYear}`,
        ...challengeData,
        challengeDate: today.toISOString().split('T')[0],
        submissionStartTime: today.toISOString(),
        submissionEndTime: tomorrow.toISOString(),
        votingStartTime: today.toISOString(),
        votingEndTime: tomorrow.toISOString(),
    };
}


export const currentChallenge = getTodaysChallenge();


export const submissions: Omit<Submission, 'id'|'createdAt'|'updatedAt'>[] = [
  { 
    challengeId: 'challenge-0', 
    userId: 'user-1', 
    photoUrl: 'submission-1',
    upvoteCount: 42, 
    submittedAt: new Date('2023-10-26T10:00:00Z').toISOString(),
    moderationStatus: 'approved'
  },
  { challengeId: 'challenge-0', userId: 'user-2', photoUrl: 'submission-2', upvoteCount: 35, submittedAt: new Date('2023-10-26T11:00:00Z').toISOString(), moderationStatus: 'approved'},
  { challengeId: 'challenge-0', userId: 'user-3', photoUrl: 'submission-3', upvoteCount: 68, submittedAt: new Date('2023-10-26T12:00:00Z').toISOString(), moderationStatus: 'approved' },
  { challengeId: 'challenge-0', userId: 'user-4', photoUrl: 'submission-4', upvoteCount: 12, submittedAt: new Date('2023-10-26T13:00:00Z').toISOString(), moderationStatus: 'approved' },
  { challengeId: 'challenge-0', userId: 'user-5', photoUrl: 'submission-5', upvoteCount: 55, submittedAt: new Date('2023-10-26T14:00:00Z').toISOString(), moderationStatus: 'approved' },
  { challengeId: 'challenge-0', userId: 'user-1', photoUrl: 'submission-6', upvoteCount: 23, submittedAt: new Date('2023-10-26T15:00:00Z').toISOString(), moderationStatus: 'approved' },
];

export const winningSubmissions: Omit<Submission, 'id'|'createdAt'|'updatedAt'>[] = [
    { challengeId: 'challenge-prev-1', userId: 'user-1', photoUrl: 'win-1', upvoteCount: 150, submittedAt: new Date('2023-10-25T10:00:00Z').toISOString(), moderationStatus: 'approved' },
    { challengeId: 'challenge-prev-2', userId: 'user-2', photoUrl: 'win-2', upvoteCount: 135, submittedAt: new Date('2023-10-24T11:00:00Z').toISOString(), moderationStatus: 'approved' },
    { challengeId: 'challenge-prev-3', userId: 'user-3', photoUrl: 'win-3', upvoteCount: 188, submittedAt: new Date('2023-10-23T12:00:00Z').toISOString(), moderationStatus: 'approved' },
]

export const badges: Badge[] = [
  { id: 'badge-1', name: '5-Day Streak', description: 'Submitted a photo 5 days in a row.', icon: Flame, criteria: "Submit a photo 5 days in a row.", imageUrl: "" },
  { id: 'badge-2', name: 'First Win', description: 'Achieved your first daily challenge win.', icon: Trophy, criteria: "Win a daily challenge.", imageUrl: "" },
  { id: 'badge-3', name: 'Hot Streak', description: 'Submitted a photo 10 days in a row.', icon: Zap, criteria: "Submit a photo 10 days in a row.", imageUrl: "" },
  { id: 'badge-4', name: 'Voter', description: 'Voted on 50 photos.', icon: Star, criteria: "Vote on 50 photos.", imageUrl: "" },
  { id: 'badge-5', name: 'Dominator', description: 'Won 5 daily challenges.', icon: Award, criteria: "Win 5 daily challenges.", imageUrl: "" },
];

export function findSubmissionById(submissionId: string) {
    const allSubmissions = [
        ...submissions.map((s, i) => ({...s, id: `submission-${i+1}`})),
        ...winningSubmissions.map((s, i) => ({...s, id: `win-${i+1}`}))
    ];
    return allSubmissions.find(sub => sub.photoUrl === submissionId);
}
