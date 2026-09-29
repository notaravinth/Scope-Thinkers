import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBookingStore } from "../store/bookingStore";

function Passenger() {
  const navigate = useNavigate();

  const selectedBus = useBookingStore(
    (state) => state.selectedBus
  );

  const selectedSeats = useBookingStore(
    (state) => state.selectedSeats
  );

  const setPassengers = useBookingStore(
    (state) => state.setPassengers
  );

  const [passengersData, setPassengersData] = useState(
    selectedSeats.map((seat) => ({
      seat,
      name: "",
      age: "",
      gender: "",
    }))
  );

  if (!selectedBus || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking information not found.</p>
      </div>
    );
  }

  const handleChange = (index, field, value) => {
    setPassengersData((current) =>
      current.map((passenger, i) =>
        i === index
          ? {
              ...passenger,
              [field]: value,
            }
          : passenger
      )
    );
  };

  const handleContinue = (e) => {
    e.preventDefault();

    setPassengers(passengersData);

    navigate("/summary");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Passenger Details
          </h1>

          <p className="mt-2 text-gray-500">
            Enter details for each passenger.
          </p>
        </div>

        <form
          onSubmit={handleContinue}
          className="space-y-6"
        >
          {passengersData.map(
            (passenger, index) => (
              <div
                key={passenger.seat}
                className="rounded-3xl bg-white p-6 shadow-sm"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Passenger {index + 1}
                  </h2>

                  <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium">
                    Seat {passenger.seat}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-3">

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={passenger.name}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      required
                      placeholder="Passenger name"
                      className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Age
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={passenger.age}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "age",
                          e.target.value
                        )
                      }
                      required
                      placeholder="Age"
                      className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Gender
                    </label>

                    <select
                      value={passenger.gender}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "gender",
                          e.target.value
                        )
                      }
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white p-3 outline-none focus:border-black"
                    >
                      <option value="">
                        Select
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                </div>
              </div>
            )
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-xl bg-black px-8 py-4 font-medium text-white transition hover:bg-gray-800"
            >
              Continue to Summary
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default Passenger;