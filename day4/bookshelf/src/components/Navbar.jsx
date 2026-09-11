import { useAuthStore } from "../store/authStore";

function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logoutUser = useAuthStore((state) => state.logoutUser);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl">
            📚
          </div>

          <div>
            <h1 className="font-bold">BookShelf</h1>

            <p className="text-xs text-slate-500">Discover your next read</p>
          </div>
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
