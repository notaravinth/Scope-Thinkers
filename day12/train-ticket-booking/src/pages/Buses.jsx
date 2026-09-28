import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase/firebase";
import { useBookingStore } from "../store/bookingStore";

function Buses() {
  const navigate = useNavigate();

  const search = useBookingStore((state) => state.search);
  const setSelectedBus = useBookingStore(
    (state) => state.setSelectedBus
  );

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoading(true);
        setError("");

        const snapshot = await getDocs(
          collection(db, "busgo_buses")
        );

        const busData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredBuses = busData.filter(
          (bus) =>
            bus.from?.toLowerCase() === search.from.toLowerCase() &&
            bus.to?.toLowerCase() === search.to.toLowerCase() &&
            bus.date === search.date
        );

        setBuses(filteredBuses);
      } catch (error) {
        console.error("Error fetching buses:", error);
        setError("Unable to load buses.");
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, [search]);

  const handleSelectBus = (bus) => {
    setSelectedBus(bus);
    navigate(`/seats/${bus.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading buses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Available Buses
          </h1>

          <p className="mt-2 text-gray-500">
            {search.from} → {search.to} · {search.date}
          </p>
        </div>

        {error && (
          <p className="mb-6 rounded-xl bg-red-50 p-4 text-red-600">
            {error}
          </p>
        )}

        {buses.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold">
              No buses found
            </h2>

            <p className="mt-2 text-gray-500">
              Try another route or date.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {buses.map((bus) => (
              <div
                key={bus.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {bus.operator}
                    </h2>

                    <p className="mt-1 text-gray-500">
                      {bus.busType}
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      {bus.departure}
                    </p>

                    <p className="text-sm text-gray-400">
                      {bus.from}
                    </p>
                  </div>

                  <div className="text-gray-400">
                    →
                  </div>

                  <div className="text-center">
                    <p className="text-lg font-semibold">
                      {bus.arrival}
                    </p>

                    <p className="text-sm text-gray-400">
                      {bus.to}
                    </p>
                  </div>

                  <div>
                    <p className="text-xl font-bold">
                      ₹{bus.price}
                    </p>

                    <p className="text-sm text-gray-500">
                      {bus.totalSeats} seats
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectBus(bus)}
                    className="rounded-xl bg-black px-6 py-3 text-white"
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Buses;