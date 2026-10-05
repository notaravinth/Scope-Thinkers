# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Chatter attachments

Chatter now supports image and file messages through Firebase Storage.

### Firebase Storage setup

1. In Firebase Console, open the same project used by Chatter.
2. Open **Storage** and click **Get started** if Storage has not been enabled yet.
3. Replace the Storage rules with the contents of `storage.rules`.
4. Make sure `VITE_FIREBASE_STORAGE_BUCKET` in your `.env` matches the bucket shown by Firebase.

Attachments are limited to 25 MB. Images are previewed inside the conversation; other files appear as downloadable file cards.

The client uploads the file directly to Firebase Storage, then sends the resulting metadata through the authenticated WebSocket. The server validates the chat participants and stores the attachment metadata in the Firestore message.
