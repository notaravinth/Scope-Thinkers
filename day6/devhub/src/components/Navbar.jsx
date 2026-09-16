import { useContext } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { signOut, getAuth } from "firebase/auth"

import { AuthContext } from "../context/AuthContext"
import app from "../firebase"

function Navbar() {
  const { user } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    const auth = getAuth(app)

    await signOut(auth)
    navigate("/login")
  }

  const activeClass = (path) => {
    return location.pathname === path
      ? "bg-zinc-800 text-white"
      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-6">

        {/* Logo */}
        <Link
          to="/explore"
          className="flex items-center gap-2 text-white"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-sm font-bold text-zinc-950">
            D
          </div>

          <span className="text-base font-semibold tracking-tight">
            DevHub
          </span>
        </Link>

        {/* Navigation */}
        <nav className="ml-10 flex items-center gap-1">

          <Link
            to="/explore"
            className={`rounded-md px-3 py-2 text-sm transition ${activeClass(
              "/explore"
            )}`}
          >
            Explore
          </Link>

          <Link
            to="/dashboard"
            className={`rounded-md px-3 py-2 text-sm transition ${activeClass(
              "/dashboard"
            )}`}
          >
            My Projects
          </Link>

        </nav>

        {/* User */}
        <div className="ml-auto flex items-center gap-4">

          {user && (
            <>
              <div className="hidden items-center gap-2 sm:flex">

                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-300">
                  {user.email?.charAt(0).toUpperCase()}
                </div>

                <span className="max-w-48 truncate text-xs text-zinc-500">
                  {user.email}
                </span>

              </div>

              <button
                onClick={handleLogout}
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                Log out
              </button>
            </>
          )}

        </div>

      </div>
    </header>
  )
}

export default Navbar