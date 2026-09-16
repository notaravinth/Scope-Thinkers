import { useContext } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Navbar from "./components/Navbar"
import { AuthContext } from "./context/AuthContext"

import Auth from "./pages/Auth"
import Explore from "./pages/Explore"
import Dashboard from "./pages/Dashboard"
import ProjectDetails from "./pages/ProjectDetails"

function App() {
  const { user } = useContext(AuthContext)

  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>

        <Route
          path="/login"
          element={!user ? <Auth /> : <Navigate to="/explore" />}
        />

        <Route
          path="/explore"
          element={user ? <Explore /> : <Navigate to="/login" />}
        />

        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />

        <Route
          path="/projects/:id"
          element={user ? <ProjectDetails /> : <Navigate to="/login" />}
        />

        <Route
          path="*"
          element={<Navigate to={user ? "/explore" : "/login"} />}
        />

      </Routes>
    </BrowserRouter>
  )
}

export default App