import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function DashboardLayout() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const navItems = [
    {
      name: "Projects",
      path: "/projects",
      icon: "▦",
    },
    {
      name: "Notifications",
      path: "/notifications",
      icon: "◔",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900 lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="text-xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
              ProjectFlow
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`
                }
              >
                <span className="w-5 text-center">
                  {item.icon}
                </span>

                {item.name}
              </NavLink>
            ))}

            <div className="mt-8">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Account
              </p>

              <div className="mt-2">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white dark:bg-white dark:text-gray-900">
                    {currentUser?.email
                      ?.charAt(0)
                      ?.toUpperCase() || "U"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {currentUser?.email || "User"}
                    </p>

                    <p className="text-xs text-gray-400">
                      Account
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900/95">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Project Management
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/notifications")}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Notifications"
              >
                ◔
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                title={
                  darkMode
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white dark:bg-white dark:text-gray-900">
                {currentUser?.email
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;