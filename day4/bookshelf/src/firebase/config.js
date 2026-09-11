import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA-RWKbAHWHdshlMmulzIisQb6j5Cyz1MM",
  authDomain: "bookshelf-dbac1.firebaseapp.com",
  projectId: "bookshelf-dbac1",
  storageBucket: "bookshelf-dbac1.firebasestorage.app",
  messagingSenderId: "607559283187",
  appId: "1:607559283187:web:af8102bfc2b90a61646286",
  measurementId: "G-H4JRL9HENL",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
