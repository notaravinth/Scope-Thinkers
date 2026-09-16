// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDOJJfrt03VaQZpOa78ZAZ8Hc02M-XJNtU",
  authDomain: "devhub-e1da0.firebaseapp.com",
  projectId: "devhub-e1da0",
  storageBucket: "devhub-e1da0.firebasestorage.app",
  messagingSenderId: "549977393048",
  appId: "1:549977393048:web:02bbd75a4c981162cf4ded",
  measurementId: "G-PFF6VJRYX8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default app