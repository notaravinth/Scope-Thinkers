import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase/config'

export const useAuthStore = create((set) => ({
    user: null,
    loading: true,

    setUser: (user) => set({
        user,
        loading: false
    }),

    logoutUser: () => set({
        user: null
    })
}))

onAuthStateChanged(auth, (user) => {
    useAuthStore.getState().setUser(user)
})