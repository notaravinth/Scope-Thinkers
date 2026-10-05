import { cert, getApps, initializeApp } from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

const firebaseAdminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
      });

export const adminAuth = getAuth(firebaseAdminApp);

export const adminDb = getFirestore(firebaseAdminApp);

export default firebaseAdminApp;
