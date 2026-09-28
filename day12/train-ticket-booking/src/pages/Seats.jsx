import { useNavigate, useParams } from "react-router-dom";
import { useBookingStore } from "../store/bookingStore";

function Seats() {
  const { busId } = useParams();
  const navigate = useNavigate();

  const selectedBus = useBookingStore(
    (state) => state.selectedBus
  );

  const selectedSeats = useBookingStore(
    (state) => state.selectedSeats
  );

  const toggleSeat = useBookingStore(
    (state) => state.toggleSeat
  );

  if (!selectedBus || selectedBus.id !== busId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Bus information not found.</p>
      </div>
    );
  }

  const seats = Array.from(
    { length: selectedBus.totalSeats },
    (_, index) => `S${index + 1}`
  );

  const totalPrice =
    selectedSeats.length * selectedBus.price;

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    navigate("/passenger");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Select Your Seats
          </h1>

          <p className="mt-2 text-gray-500">
            {selectedBus.operator} · {selectedBus.busType}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <div className="mb-8 rounded-xl bg-gray-100 p-3 text-center font-medium">
              Driver
            </div>

            <div className="grid grid-cols-4 gap-4">
              {seats.map((seat, index) => {
                const isSelected =
                  selectedSeats.includes(seat);

                const isOccupied =
                  [2, 7, 13, 18].includes(index);

                return (
                  <button
                    key={seat}
                    disabled={isOccupied}
                    onClick={() => toggleSeat(seat)}
                    className={`rounded-xl border p-4 text-sm font-medium transition ${
                      isOccupied
                        ? "cursor-not-allowed bg-gray-200 text-gray-400"
                        : isSelected
                        ? "bg-black text-white"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {seat}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-white border" />
                Available
              </div>

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-black" />
                Selected
              </div>

              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded bg-gray-200" />
                Occupied
              </div>
            </div>
          </div>

          <div className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Booking Summary
            </h2>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">
                  Bus
                </span>

                <span>
                  {selectedBus.operator}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Seats
                </span>

                <span>
                  {selectedSeats.length || "None"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Price / seat
                </span>

                <span>
                  ₹{selectedBus.price}
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>

                  <span>₹{totalPrice}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="mt-6 w-full rounded-xl bg-black p-4 text-white"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Seats;