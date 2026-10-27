# Matchwise Firestore favourites

## Changes
- Favourite jobs are stored in Cloud Firestore at `matchwise_favourites/{userId}/jobs/{jobId}`.
- The signed-in user's saved jobs are loaded in real time, and the existing Favourites view displays them.
- Unfavouriting deletes that user's saved job document.
- Existing app UI, matching logic, authentication, and other files are retained.

## Setup
1. Ensure Cloud Firestore is enabled in your Firebase project.
2. In Firebase Console, open **Firestore Database → Rules**. Keep your existing Chatter rules and add the block in `firestore-favourites-rules-snippet.txt` inside the existing `match /databases/{database}/documents` block. Do not add a second `service cloud.firestore` block.
3. Publish the rules.
4. From `frontend`, run `npm install firebase` if needed, then `npm run dev`.

The Firestore path is scoped by Firebase UID and the rules restrict access to that same UID.
