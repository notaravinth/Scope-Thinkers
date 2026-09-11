import { create } from "zustand";
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";

export const useBookStore = create((set) => ({
  books: [],
  favorites: [],
  loading: false,
  error: null,

  fetchBooks: async (query) => {
    set({
      loading: true,
      error: null,
    });

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${query}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();

      set({
        books: data.docs,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false,
      });
    }
  },

  addFavorite: async (userId, book) => {
    const favoriteRef = doc(
      db,
      "users",
      userId,
      "favorites",
      book.key.replaceAll("/", "_"),
    );

    await setDoc(favoriteRef, {
      key: book.key,
      title: book.title,
      author: book.author_name?.join(", ") || "Unknown Author",
      coverId: book.cover_i || null,
      year: book.first_publish_year || null,
    });

    set((state) => ({
      favorites: [...state.favorites, book],
    }));
  },

  removeFavorite: async (userId, bookKey) => {
    const favoriteRef = doc(
      db,
      "users",
      userId,
      "favorites",
      bookKey.replaceAll("/", "_"),
    );

    await deleteDoc(favoriteRef);

    set((state) => ({
      favorites: state.favorites.filter((book) => book.key !== bookKey),
    }));
  },

  loadFavorites: async (userId) => {
    const favoritesRef = collection(db, "users", userId, "favorites");

    const snapshot = await getDocs(favoritesRef);

    const favorites = snapshot.docs.map((doc) => doc.data());

    set({
      favorites,
    });
  },
}));
