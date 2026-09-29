import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

export async function createOrUpdateUser(user) {
  if (!user) return;

  const userRef = doc(
    db,
    "busgo_users",
    user.uid
  );

  await setDoc(
    userRef,
    {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "",
      photoURL: user.photoURL || "",
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}