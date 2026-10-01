import { Link, useLocation } from "react-router-dom";
import { useFavorites } from "../context/FavouritesContext";

const Navbar = () => {
  const { favorites } = useFavorites();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isFavorites = location.pathname === "/favorites";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          Nestify
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
          <Link
            to="/"
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              isHome
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Home
          </Link>

          <Link
            to="/favorites"
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
              isFavorites
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>♡</span>

            <span>Favorites</span>

            {favorites.length > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs font-semibold text-white">
                {favorites.length}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;