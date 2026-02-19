import type { LucideIcon } from "lucide-react";
import type { Song } from "./musicService";

export type User = {
  id: string;
  name: string;
  avatarId: string;
  streak: number;
  totalUpvotes: number;
  wins: string[]; // submission IDs
  friends: string[]; // array of user IDs
  friendRequests: string[]; // array of user IDs
};

export type Challenge = {
  id: string;
  topic: string;
  description: string;
  date: string; // ISO string
};

export type Submission = {
  id: string;
  userId: string;
  challengeId: string;
  imageId: string;
  upvotes: number;
  timestamp: string; // ISO string
  song?: Song;
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};
