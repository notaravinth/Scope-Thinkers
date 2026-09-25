import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";

const statuses = [
  {
    id: "placed",
    label: "Order Placed",
    description: "Your order has been received.",
  },
  {
    id: "confirmed",
    label: "Order Confirmed",
    description: "The restaurant has confirmed your order.",
  },
  {
    id: "preparing",
    label: "Preparing",
    description: "Your food is being prepared.",
  },
  {
    id: "out_for_delivery",
    label: "Out for Delivery",
    description: "Your order is on the way.",
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Your order has arrived.",
  },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    const orderRef = doc(db, "orders", orderId);

    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Order not found.");
          setOrder(null);
        } else {
          setOrder({
            id: snapshot.id,
            ...snapshot.data(),
          });
          setError("");
        }

        setLoading(false);
      },
      (snapshotError) => {
        console.error("Order listener error:", snapshotError);
        setError("Unable to load your order.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          <p className="text-sm text-zinc-500">
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-xl">
          <h1 className="text-2xl font-bold text-zinc-900">
            Order unavailable
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            {error || "We couldn't find this order."}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-6 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Back to Foodity
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statuses.findIndex(
    (status) => status.id === order.orderStatus
  );

  const createdAt = order.createdAt?.toDate
    ? order.createdAt.toDate()
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-28">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
            Order Tracking
          </p>

          <h1 className="mt-2 text-4xl font-bold text-zinc-900">
            Your order is on its way
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Order ID: {order.orderId}
          </p>
        </div>

        {/* Status */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">
                Current status
              </p>

              <h2 className="mt-1 text-2xl font-bold text-zinc-900">
                {statuses[currentStatusIndex]?.label ||
                  "Processing"}
              </h2>
            </div>

            <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              {order.paymentStatus === "paid"
                ? "Payment Paid"
                : "Payment Pending"}
            </div>
          </div>

          <div className="space-y-6">
            {statuses.map((status, index) => {
              const completed =
                currentStatusIndex >= index;

              const current =
                currentStatusIndex === index;

              return (
                <div
                  key={status.id}
                  className="flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold ${
                        completed
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-zinc-200 bg-white text-zinc-400"
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    {index < statuses.length - 1 && (
                      <div
                        className={`mt-2 h-10 w-0.5 ${
                          currentStatusIndex > index
                            ? "bg-green-500"
                            : "bg-zinc-200"
                        }`}
                      />
                    )}
                  </div>

                  <div className="pt-1">
                    <h3
                      className={`font-semibold ${
                        current
                          ? "text-zinc-900"
                          : completed
                          ? "text-zinc-700"
                          : "text-zinc-400"
                      }`}
                    >
                      {status.label}
                    </h3>

                    <p className="mt-1 text-sm text-zinc-500">
                      {status.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order details */}
        <div className="mt-6 grid gap-6 md:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
            <h2 className="text-xl font-bold text-zinc-900">
              Order Items
            </h2>

            <div className="mt-6 space-y-4">
              {order.items?.map((item, index) => (
                <div
                  key={`${item.itemID ?? item.itemName}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-zinc-50 p-4"
                >
                  <div>
                    <p className="font-medium text-zinc-900">
                      {item.itemName}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      ₹{item.itemPrice} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold text-zinc-900">
                    ₹{item.itemPrice * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl">
            <h2 className="text-xl font-bold text-zinc-900">
              Payment Summary
            </h2>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>

              <div className="flex justify-between text-sm text-zinc-500">
                <span>Delivery</span>
                <span>
                  {order.deliveryFee === 0
                    ? "FREE"
                    : `₹${order.deliveryFee}`}
                </span>
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <div className="flex justify-between">
                  <span className="font-medium text-zinc-600">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-zinc-900">
                    ₹{order.total}
                  </span>
                </div>
              </div>
            </div>

            {createdAt && (
              <p className="mt-6 text-xs text-zinc-400">
                Placed on{" "}
                {createdAt.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-8 rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
        >
          Continue Ordering
        </button>
      </div>
    </div>
  );
};

export default OrderTracking;