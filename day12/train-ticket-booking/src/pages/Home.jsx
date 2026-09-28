import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../store/bookingStore";

function Home() {
  const navigate = useNavigate();

  const setSearch = useBookingStore((state) => state.setSearch);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    setSearch({
      from,
      to,
      date,
    });

    navigate("/buses");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <h1 className="text-5xl font-bold">
            Where are you going?
          </h1>

          <p className="mt-3 text-gray-500">
            Find and book your next bus journey.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="grid gap-4 rounded-3xl bg-white p-6 shadow"
        >
          <input
            type="text"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
            className="rounded-xl border p-4"
          />

          <input
            type="text"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            className="rounded-xl border p-4"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="rounded-xl border p-4"
          />

          <button
            type="submit"
            className="rounded-xl bg-black p-4 font-medium text-white"
          >
            Search Buses
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;