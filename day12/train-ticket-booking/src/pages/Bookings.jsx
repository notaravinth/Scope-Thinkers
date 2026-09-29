import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase/firebase";
import { useAuthStore } from "../store/authStore";

function Bookings() {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user
  );

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError("");

        const bookingsQuery = query(
          collection(db, "busgo_bookings"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot =
          await getDocs(bookingsQuery);

        const bookingData =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setBookings(bookingData);
      } catch (error) {
        console.error(
          "Error fetching bookings:",
          error
        );

        setError(
          "Unable to load your bookings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading your bookings...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              My Bookings
            </h1>

            <p className="mt-2 text-gray-500">
              View your bus journeys and
              payment details.
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            Book a Bus
          </button>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Empty */}

        {!error && bookings.length === 0 && (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">

            <h2 className="text-xl font-semibold">
              No bookings yet
            </h2>

            <p className="mt-2 text-gray-500">
              Your confirmed trips will appear
              here.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 rounded-xl bg-black px-6 py-3 text-white"
            >
              Search Buses
            </button>

          </div>
        )}

        {/* Bookings */}

        <div className="space-y-5">

          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="rounded-3xl bg-white p-6 shadow-sm"
            >

              {/* Top */}

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <h2 className="text-xl font-bold">
                    {booking.operator}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {booking.busType}
                  </p>
                </div>

                <span className="w-fit rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-600">
                  {booking.status}
                </span>

              </div>

              {/* Journey */}

              <div className="mt-6 grid gap-6 border-t pt-6 md:grid-cols-3">

                <div>
                  <p className="text-2xl font-bold">
                    {booking.departure}
                  </p>

                  <p className="text-gray-500">
                    {booking.from}
                  </p>
                </div>

                <div className="flex items-center justify-center text-gray-400">
                  →
                </div>

                <div>
                  <p className="text-2xl font-bold">
                    {booking.arrival}
                  </p>

                  <p className="text-gray-500">
                    {booking.to}
                  </p>
                </div>

              </div>

              {/* Details */}

              <div className="mt-6 grid gap-4 border-t pt-6 md:grid-cols-3">

                <div>
                  <p className="text-sm text-gray-500">
                    Journey Date
                  </p>

                  <p className="mt-1 font-medium">
                    {booking.date}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Seats
                  </p>

                  <p className="mt-1 font-medium">
                    {booking.seats?.join(", ")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Amount Paid
                  </p>

                  <p className="mt-1 font-semibold">
                    ₹{booking.totalAmount}
                  </p>
                </div>

              </div>

              {/* Payment */}

              <div className="mt-6 border-t pt-6">

                <div className="flex flex-col gap-2 text-sm text-gray-500">

                  <p>
                    Payment ID:{" "}
                    <span className="font-medium text-gray-700">
                      {booking.paymentId}
                    </span>
                  </p>

                  <p>
                    Booking ID:{" "}
                    <span className="font-medium text-gray-700">
                      {booking.id}
                    </span>
                  </p>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>
    </div>
  );
}

export default Bookings;