import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { useBookingStore } from "../store/bookingStore";
import { loadRazorpay } from "../utils/loadRazorPay";
import { auth, db } from "../firebase/firebase";

function Summary() {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (
    !selectedBus ||
    selectedSeats.length === 0 ||
    passengers.length === 0
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Booking information not found.</p>
      </div>
    );
  }

  const totalAmount =
    selectedSeats.length * selectedBus.price;

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError("");

      /* Load Razorpay */

      const razorpayLoaded =
        await loadRazorpay();

      if (!razorpayLoaded) {
        throw new Error(
          "Unable to load Razorpay Checkout."
        );
      }

      /* Create Razorpay order */

      const orderResponse = await fetch(
        "http://localhost:3000/create-payment-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalAmount,
          }),
        }
      );

      const orderData =
        await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderData.message ||
            "Unable to create payment order."
        );
      }

      /* Razorpay Checkout */

      const options = {
        key: import.meta.env
          .VITE_RAZORPAY_KEY_ID,

        amount: orderData.amount,

        currency: orderData.currency,

        name: "BusGo",

        description: `${selectedBus.operator} Bus Booking`,

        order_id: orderData.orderId,

        prefill: {
          email: auth.currentUser?.email || "",
          name: passengers[0]?.name || "",
        },

        theme: {
          color: "#000000",
        },

        handler: async function (response) {
          try {
            /* Verify payment */

            const verifyResponse =
              await fetch(
                "http://localhost:3000/verify-payment",
                {
                  method: "POST",

                  headers: {
                    "Content-Type":
                      "application/json",
                  },

                  body: JSON.stringify({
                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  }),
                }
              );

            const verifyData =
              await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message ||
                  "Payment verification failed."
              );
            }

            /* Get signed-in user */

            const user =
              auth.currentUser;

            if (!user) {
              throw new Error(
                "User is not authenticated."
              );
            }

            /* Save booking */

            const bookingData = {
              userId: user.uid,

              userEmail:
                user.email || "",

              busId: selectedBus.id,

              operator:
                selectedBus.operator,

              from: selectedBus.from,

              to: selectedBus.to,

              departure:
                selectedBus.departure,

              arrival:
                selectedBus.arrival,

              date: selectedBus.date,

              busType:
                selectedBus.busType,

              seats: selectedSeats,

              passengers: passengers,

              totalAmount: totalAmount,

              paymentId:
                response.razorpay_payment_id,

              orderId:
                response.razorpay_order_id,

              status: "confirmed",

              createdAt:
                serverTimestamp(),
            };

            const bookingRef =
              await addDoc(
                collection(
                  db,
                  "busgo_bookings"
                ),
                bookingData
              );

            console.log(
              "Booking created:",
              bookingRef.id
            );

            /* Go to confirmation */

            navigate("/confirmation", {
              state: {
                bookingId:
                  bookingRef.id,

                paymentId:
                  response.razorpay_payment_id,

                orderId:
                  response.razorpay_order_id,

                amount: totalAmount,
              },
            });
          } catch (error) {
            console.error(
              "Booking/payment error:",
              error
            );

            setError(
              error.message ||
                "Unable to complete booking."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          setError(
            response.error?.description ||
              "Payment failed."
          );

          setLoading(false);
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      setError(
        error.message ||
          "Unable to start payment."
      );

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-4xl">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Booking Summary
          </h1>

          <p className="mt-2 text-gray-500">
            Review your journey before payment.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_320px]">

          {/* Journey */}

          <div className="space-y-6">

            <div className="rounded-3xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Journey
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

            <div className="rounded-3xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Selected Seats
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

            <div className="rounded-3xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Passengers
              </h2>

              <div className="mt-5 space-y-4">

                {passengers.map(
                  (passenger) => (
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
                  )
                )}

              </div>

            </div>

          </div>

          {/* Payment */}

          <div className="h-fit rounded-3xl bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
              Payment
            </h2>

            <div className="mt-6 space-y-4">

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Seats
                </span>

                <span>
                  {selectedSeats.length}
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

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>

                  <span>
                    ₹{totalAmount}
                  </span>
                </div>

              </div>

            </div>

            {error && (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-black p-4 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : `Pay ₹${totalAmount}`}
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              Demo payment · Razorpay Test Mode
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Summary;