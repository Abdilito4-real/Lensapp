import type { LucideIcon } from "lucide-react";
import type { FieldValue } from 'firebase/firestore';

export type UserProfile = {
  id: string;
  displayName: string;
  profileImageUrl?: string;
  currentStreak: number;
  highestStreak: number;
  totalSubmissions: number;
  totalUpvotesReceived: number;
  totalWins: number;
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export type Challenge = {
  id: string;
  title: string;
  description: string;
  challengeDate: string;
  submissionStartTime: string;
  submissionEndTime: string;
  votingStartTime: string;
  votingEndTime: string;
  winningSubmissionId?: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export type Submission = {
  id: string;
  challengeId: string;
  userId: string;
  photoUrl: string;
  thumbnailUrl?: string;
  submittedAt: string;
  upvoteCount: number;
  aiAnalysisResult?: string;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export type Vote = {
  id: string;
  submissionId: string;
  userId: string;
  votedAt: FieldValue;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  criteria: string;
  icon: LucideIcon; // For client-side display
};

export type UserBadge = {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: FieldValue;
};
