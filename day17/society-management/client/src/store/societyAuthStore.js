import { create } from "zustand";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../config/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const useSocietyAuthStore = create((set) => ({
  firebaseUser: null,
  societyUser: null,
  loading: true,

  initializeAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        set({
          firebaseUser: null,
          societyUser: null,
          loading: false,
        });
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();

        const response = await fetch(`${API_URL}/society-auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Society profile not found");
        }

        set({
          firebaseUser,
          societyUser: data.user,
          loading: false,
        });
      } catch (error) {
        console.error("Auth initialization error:", error);

        set({
          firebaseUser,
          societyUser: null,
          loading: false,
        });
      }
    });

    return unsubscribe;
  },

  logout: async () => {
    await signOut(auth);

    set({
      firebaseUser: null,
      societyUser: null,
    });
  },

  setSocietyUser: (societyUser) => set({ societyUser }),
}));

export default useSocietyAuthStore;
