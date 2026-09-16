import { createContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { getAuth } from "firebase/auth"
import app from "../firebase"

export const AuthContext = createContext()

function AuthProvider({ children }) {

  const [user, setUser] = useState(null)

  useEffect(() => {

    const auth = getAuth(app)

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    return () => unsubscribe()

  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider