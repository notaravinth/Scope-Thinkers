import { useContext } from "react"
import {
BrowserRouter,
Routes,
Route,
Navigate,
} from "react-router-dom"

import Navbar from "./components/Navbar"
import { AuthContext } from "./context/AuthContext"

import Auth from "./pages/Auth"
import Explore from "./pages/Explore"
import Dashboard from "./pages/Dashboard"
import ProjectDetails from "./pages/ProjectDetails"
import CreateProject from "./pages/CreateProject"

function App() {
const { user } = useContext(AuthContext)

return ( <BrowserRouter>

```
  {user && <Navbar />}

  <Routes>

    {/* Authentication */}
    <Route
      path="/login"
      element={
        !user
          ? <Auth />
          : <Navigate to="/explore" />
      }
    />

    {/* Explore */}
    <Route
      path="/explore"
      element={
        user
          ? <Explore />
          : <Navigate to="/login" />
      }
    />

    {/* Dashboard */}
    <Route
      path="/dashboard"
      element={
        user
          ? <Dashboard />
          : <Navigate to="/login" />
      }
    />

    {/* Create Project */}
    <Route
      path="/projects/new"
      element={
        user
          ? <CreateProject />
          : <Navigate to="/login" />
      }
    />

    {/* Project Details */}
    <Route
      path="/projects/:id"
      element={
        user
          ? <ProjectDetails />
          : <Navigate to="/login" />
      }
    />

    {/* Unknown route */}
    <Route
      path="*"
      element={
        <Navigate
          to={user ? "/explore" : "/login"}
        />
      }
    />

  </Routes>

</BrowserRouter>

)
}

export default App
