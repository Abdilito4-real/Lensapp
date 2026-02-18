# **App Name**: LensLock

## Core Features:

- Daily Photo Challenge: Presents a new photo challenge every day at 8:00 AM.
- Photo Submission with Compression: Allows users to submit one photo per challenge, automatically compressing images before upload.
- Anonymous Voting System: Enables users to vote on submissions anonymously during a set time window, with an unlike feature.
- Streak Tracker and Badges: Tracks users' submission streaks and awards badges for milestone achievements.
- Leaderboard: Displays leaderboards for top submissions and user streaks.
- Generative AI Photo Analysis: Leverages generative AI to automatically determine whether photos align with a given daily topic, presenting its conclusions to human moderators as a tool to help review questionable images.
- Firebase Integration: Uses Firebase Authentication, Firestore, and Storage for user management, data storage, and image hosting.
- Camera Integration: Seamless photo upload using the `getUserMedia` API to access the camera directly in the browser.
- Push Notifications: Sends notifications for new challenges, voting reminders, and upvotes using Web Push API or OneSignal.
- 24-Hour Timer: Displays a countdown on the home screen using JavaScript `setInterval`.
- Upvote System: Implements a tap-to-vote system using a real-time database like Firebase Firestore or Supabase.
- Anonymous Submissions: Stores photos without usernames during submission phase, revealing winner identity only at end.
- Profile Pages: Displays Hall of Fame, past wins, total upvotes using user authentication (Google OAuth).
- Offline Capability: Allows users to view the challenge and prepare their photo even with bad WiFi using Service Worker caching.

## Style Guidelines:

- Primary color: Vibrant purple (#7C3AED) for buttons, active icons, links.
- Secondary color: Soft pink (#EC4899) for accents, badges, highlights.
- Background color: Off-white (#F9FAFB) for the main background.
- Body and headline font: 'Inter', a sans-serif, for a modern, neutral look, and pleasant reading experience.
- Use clean, modern icons, filled when active, outlined when inactive.
- Mobile-first, responsive design with a bottom navigation bar for main sections.
- Smooth transitions and subtle animations when submitting photos or voting.