import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

import { useBookingStore } from "../store/bookingStore";

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedBus = useBookingStore(
    (state) => state.selectedBus
  );

  const selectedSeats = useBookingStore(
    (state) => state.selectedSeats
  );

  const passengers = useBookingStore(
    (state) => state.passengers
  );

  const clearBooking = useBookingStore(
    (state) => state.clearBooking
  );

  const paymentId =
    location.state?.paymentId;

  const orderId =
    location.state?.orderId;

  const amount =
    location.state?.amount;

  if (
    !selectedBus ||
    selectedSeats.length === 0 ||
    passengers.length === 0
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Booking not found
          </h1>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-xl bg-black px-6 py-3 text-white"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleDone = () => {
    clearBooking();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">

        {/* Success */}

        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle
              size={48}
              className="text-green-600"
            />
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Booking Confirmed
          </h1>

          <p className="mt-2 text-gray-500">
            Your bus ticket has been booked successfully.
          </p>

        </div>

        {/* Journey */}

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold">
            Journey Details
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">

            <div>
              <p className="text-2xl font-bold">
                {selectedBus.departure}
              </p>

              <p className="text-gray-500">
                {selectedBus.from}
              </p>
            </div>

            <div className="flex items-center justify-center text-gray-400">
              →
            </div>

            <div>
              <p className="text-2xl font-bold">
                {selectedBus.arrival}
              </p>

              <p className="text-gray-500">
                {selectedBus.to}
              </p>
            </div>

          </div>

          <div className="mt-6 border-t pt-6">

            <p className="font-semibold">
              {selectedBus.operator}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {selectedBus.busType}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {selectedBus.date}
            </p>

          </div>

        </div>

        {/* Seats */}

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold">
            Seats
          </h2>

          <div className="mt-4 flex flex-wrap gap-3">

            {selectedSeats.map((seat) => (
              <span
                key={seat}
                className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium"
              >
                {seat}
              </span>
            ))}

          </div>

        </div>

        {/* Passengers */}

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold">
            Passengers
          </h2>

          <div className="mt-5 space-y-3">

            {passengers.map((passenger) => (
              <div
                key={passenger.seat}
                className="flex items-center justify-between rounded-2xl bg-gray-50 p-4"
              >
                <div>
                  <p className="font-semibold">
                    {passenger.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {passenger.age} years ·{" "}
                    {passenger.gender}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-sm">
                  {passenger.seat}
                </span>
              </div>
            ))}

          </div>

        </div>

        {/* Payment */}

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

          <h2 className="text-xl font-bold">
            Payment
          </h2>

          <div className="mt-5 space-y-3">

            <div className="flex justify-between">
              <span className="text-gray-500">
                Amount
              </span>

              <span className="font-semibold">
                ₹{amount}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Payment ID
              </span>

              <span className="max-w-[220px] truncate text-sm font-medium">
                {paymentId}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Order ID
              </span>

              <span className="max-w-[220px] truncate text-sm font-medium">
                {orderId}
              </span>
            </div>

            <div className="flex justify-between border-t pt-4">
              <span className="text-gray-500">
                Status
              </span>

              <span className="font-semibold text-green-600">
                Paid
              </span>
            </div>

          </div>

        </div>

        <button
          onClick={handleDone}
          className="mt-6 w-full rounded-xl bg-black p-4 font-medium text-white transition hover:bg-gray-800"
        >
          Done
        </button>

      </div>
    </div>
  );
}

export default Confirmation;