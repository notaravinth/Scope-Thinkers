import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setUser(data.user);

      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <nav className="border-b border-slate-800 px-8 py-4 flex justify-between">
        <h1 className="text-xl font-bold">
          Auth Lab
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </nav>

      <main className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">

          <h1 className="text-4xl font-bold">
            Welcome, {user?.email}
          </h1>

          <p className="text-slate-400 mt-3">
            Your JWT was successfully verified by the server.
          </p>

          <p className="text-slate-500 mt-2">
            User ID: {user?.userId}
          </p>

        </div>
      </main>

    </div>
  );
}

export default Dashboard;