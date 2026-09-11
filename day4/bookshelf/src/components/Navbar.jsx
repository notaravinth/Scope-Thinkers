import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useBookStore } from "../store/bookStore";

function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logoutUser = useAuthStore((state) => state.logoutUser);

  const favorites = useBookStore((state) => state.favorites);

  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}

        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl">
            📚
          </div>

          <div>
            <h1 className="font-bold">BookShelf</h1>

            <p className="text-xs text-slate-500">Discover your next read</p>
          </div>
        </Link>

        {/* Navigation */}

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={`px-4 py-2 rounded-xl text-sm transition ${
              location.pathname === "/"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            Discover
          </Link>

          <Link
            to="/library"
            className={`px-4 py-2 rounded-xl text-sm transition ${
              location.pathname === "/library"
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span className="mr-1">♥</span>
            Library
            {favorites.length > 0 && (
              <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {favorites.length}
              </span>
            )}
          </Link>
        </div>

        {/* User */}

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm text-slate-300">{user?.email}</p>

            <p className="text-xs text-slate-500">Reader</p>
          </div>

          <button
            onClick={logoutUser}
            className="px-4 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl hover:border-red-500/40 hover:text-red-400 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
