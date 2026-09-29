import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

import { useBookingStore } from "../store/bookingStore";
import { useAuthStore } from "../store/authStore";
import { auth, db } from "../firebase/firebase";

function Home() {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user
  );

  const setSearch = useBookingStore(
    (state) => state.setSearch
  );

  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const userRef = doc(
          db,
          "busgo_users",
          user.uid
        );

        const userSnapshot =
          await getDoc(userRef);

        if (userSnapshot.exists()) {
          const userData =
            userSnapshot.data();

          setName(userData.name || "");
        }
      } catch (error) {
        console.error(
          "Error loading user profile:",
          error
        );
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();

    setSearch({
      from,
      to,
      date,
    });

    navigate("/buses");
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await signOut(auth);

      navigate("/login");
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-gray-500">
              Welcome back
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              {name
                ? `Welcome, ${name} 👋`
                : "Welcome to BusGo 👋"}
            </h1>

            {user?.email && (
              <p className="mt-2 text-sm text-gray-500">
                {user.email}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() =>
                navigate("/bookings")
              }
              className="rounded-xl bg-white px-5 py-3 text-sm font-medium shadow-sm transition hover:bg-gray-100"
            >
              My Bookings
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              {loggingOut
                ? "Logging out..."
                : "Log Out"}
            </button>

          </div>

        </div>

        {/* Search */}

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <div className="mb-8">

            <h2 className="text-2xl font-bold">
              Where are you going?
            </h2>

            <p className="mt-2 text-gray-500">
              Find and book your next bus journey.
            </p>

          </div>

          <form
            onSubmit={handleSearch}
            className="grid gap-4 md:grid-cols-4"
          >

            <div>
              <label className="mb-2 block text-sm font-medium">
                From
              </label>

              <input
                type="text"
                placeholder="Chennai"
                value={from}
                onChange={(e) =>
                  setFrom(e.target.value)
                }
                required
                className="w-full rounded-xl border border-gray-200 p-4 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                To
              </label>

              <input
                type="text"
                placeholder="Bangalore"
                value={to}
                onChange={(e) =>
                  setTo(e.target.value)
                }
                required
                className="w-full rounded-xl border border-gray-200 p-4 outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Journey Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                required
                className="w-full rounded-xl border border-gray-200 p-4 outline-none focus:border-black"
              />
            </div>

            <div className="flex items-end">

              <button
                type="submit"
                className="w-full rounded-xl bg-black p-4 font-medium text-white transition hover:bg-gray-800"
              >
                Search Buses
              </button>

            </div>

          </form>

        </div>

        {/* Quick Actions */}

        <div className="mt-8 grid gap-4 md:grid-cols-2">

          <button
            onClick={() =>
              navigate("/bookings")
            }
            className="rounded-3xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <h3 className="text-lg font-semibold">
              My Bookings
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              View your upcoming and previous
              bus journeys.
            </p>
          </button>

          <button
            onClick={() => {
              setFrom("");
              setTo("");
              setDate("");
            }}
            className="rounded-3xl bg-white p-6 text-left shadow-sm transition hover:shadow-md"
          >
            <h3 className="text-lg font-semibold">
              Plan a New Trip
            </h3>

            <p className="mt-2 text-sm text-gray-500">
              Search for buses and plan your
              next journey.
            </p>
          </button>

        </div>

      </div>
    </div>
  );
}

export default Home;