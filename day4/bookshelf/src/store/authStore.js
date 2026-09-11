import { create } from "zustand";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) =>
    set({
      user,
      loading: false,
    }),

  logoutUser: async () => {
    await signOut(auth);
  },
}));

onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
});
