import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase/firebase";
import { useAuthStore } from "./store/authStore";
import { createOrUpdateUser } from "./services/userService";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Buses from "./pages/Buses";
import Seats from "./pages/Seats";
import Passenger from "./pages/Passenger";
import Summary from "./pages/Summary";
import Confirmation from "./pages/Confirmation";
import Bookings from "./pages/Bookings";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await createOrUpdateUser(user);
        }

        setUser(user);
      } catch (error) {
        console.error("Error creating user profile:", error);

        setUser(user);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        {/* Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Bus Search Results */}
        <Route
          path="/buses"
          element={
            <ProtectedRoute>
              <Buses />
            </ProtectedRoute>
          }
        />

        {/* Seat Selection */}
        <Route
          path="/seats/:busId"
          element={
            <ProtectedRoute>
              <Seats />
            </ProtectedRoute>
          }
        />

        <Route
          path="/passenger"
          element={
            <ProtectedRoute>
              <Passenger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <ProtectedRoute>
              <Summary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/confirmation"
          element={
            <ProtectedRoute>
              <Confirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Bookings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
