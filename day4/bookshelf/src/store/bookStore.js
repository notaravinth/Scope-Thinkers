import { create } from 'zustand'

export const useBookStore = create((set) => ({
    books: [],
    favorites: [],
    loading: false,
    error: null,

    fetchBooks: async (query) => {
        set({
            loading: true,
            error: null
        })

        try {
            const response = await fetch(
                `https://openlibrary.org/search.json?q=${query}`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch books')
            }

            const data = await response.json()

            set({
                books: data.docs,
                loading: false
            })
        } catch (error) {
            set({
                error: error.message,
                loading: false
            })
        }
    },

    addFavorite: (book) => set((state) => ({
        favorites: [...state.favorites, book]
    })),

    removeFavorite: (bookKey) => set((state) => ({
        favorites: state.favorites.filter(
            (book) => book.key !== bookKey
        )
    }))
}))