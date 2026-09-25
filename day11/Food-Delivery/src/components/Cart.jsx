import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import SoftAurora from "./react-bits/SoftAurora";
import SlideCommit from "./react-bits/SlideCommit";
import { useCart } from "../context/CartContext";
import { db } from "../firebase/firebase";

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    subtotal,
  } = useCart();

  const [paymentError, setPaymentError] = useState("");

  const deliveryFee = subtotal > 499 || subtotal === 0 ? 0 : 40;
  const total = subtotal + deliveryFee;

  const handlePayment = () =>
    new Promise(async (resolve, reject) => {
      try {
        setPaymentError("");

        // Create Razorpay order
        console.log("Creating Razorpay order...", {
          total,
        });

        const orderResponse = await fetch("/api/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total,
          }),
        });

        console.log("Order response status:", orderResponse.status);

        const orderData = await orderResponse.json();

        console.log("Order response data:", orderData);

        if (!orderResponse.ok || !orderData.success) {
          throw new Error(
            orderData.message || "Unable to create payment order."
          );
        }

        if (!window.Razorpay) {
          throw new Error("Razorpay Checkout failed to load.");
        }

        console.log("Opening Razorpay Checkout...", {
          orderId: orderData.order_id,
          amount: orderData.amount,
          currency: orderData.currency,
        });

        // Open Razorpay Checkout
        const razorpay = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Foodity",
          description: "Foodity Food Order",
          order_id: orderData.order_id,

          handler: async (response) => {
            try {
              console.log("Razorpay payment successful:", response);

              // Verify payment on backend
              const verifyResponse = await fetch("/api/verify-payment", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              console.log(
                "Verification response status:",
                verifyResponse.status
              );

              const verifyData = await verifyResponse.json();

              console.log("Verification response data:", verifyData);

              if (!verifyResponse.ok || !verifyData.success) {
                throw new Error(
                  verifyData.message || "Payment verification failed."
                );
              }

              console.log("Payment verified successfully.");

              // Prepare cart items for Firestore
              const orderItems = cartItems.map((item) => ({
                itemID: item.itemID ?? item.id ?? null,
                itemName: item.itemName,
                itemPrice: Number(item.itemPrice ?? item.price ?? 0),
                quantity: item.quantity,
                imageUrl: item.imageUrl ?? null,
              }));

              // Use Razorpay order ID as Firestore document ID
              const orderId = response.razorpay_order_id;

              // Save order to Firestore
              await setDoc(doc(db, "orders", orderId), {
                orderId,
                paymentId: response.razorpay_payment_id,

                items: orderItems,

                subtotal,
                deliveryFee,
                total,

                paymentStatus: "paid",
                orderStatus: "placed",

                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });

              console.log("Order saved to Firestore:", orderId);

              // Clear cart after successful order creation
              clearCart();

              // Redirect to live order tracking page
              navigate(`/order/${orderId}`);

              resolve();
            } catch (error) {
              console.error("Payment verification/order error:", error);

              setPaymentError(
                error.message || "Payment verification failed."
              );

              reject(error);
            }
          },

          modal: {
            ondismiss: () => {
              const error = new Error("Payment cancelled.");

              console.log("Razorpay checkout dismissed.");

              setPaymentError("Payment cancelled.");
              reject(error);
            },
          },

          theme: {
            color: "#22c55e",
          },
        });

        razorpay.on("payment.failed", (response) => {
          console.error("Razorpay payment failed:", response);

          const message =
            response?.error?.description || "Payment failed.";

          console.log("Payment failure details:", {
            code: response?.error?.code,
            description: response?.error?.description,
            reason: response?.error?.reason,
            source: response?.error?.source,
            step: response?.error?.step,
            metadata: response?.error?.metadata,
          });

          setPaymentError(message);
          reject(new Error(message));
        });

        razorpay.open();
      } catch (error) {
        console.error("Payment error:", error);

        setPaymentError(
          error.message || "Unable to start payment."
        );

        reject(error);
      }
    });

  return (
    <div id="cart" className="relative min-h-screen w-full overflow-hidden">
      {/* Aurora Background */}
      <div className="absolute inset-0">
        <SoftAurora
          speed={0.6}
          scale={1.5}
          brightness={1}
          color1="#f7f7f7"
          color2="#e100ff"
          noiseFrequency={2.5}
          noiseAmplitude={1}
          bandHeight={0.5}
          bandSpread={1}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={1}
          enableMouseInteraction
          mouseInfluence={0.25}
        />
      </div>

      {/* Cart */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
                Your Order
              </p>

              <h1 className="text-4xl font-bold text-zinc-900">
                Your Cart
              </h1>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm font-medium text-red-500 transition hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Empty Cart */}
          {cartItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-10 text-center">
              <p className="text-lg font-medium text-zinc-700">
                Your cart is empty
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                Add some delicious food from the menu.
              </p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const itemId =
                    item.itemID ??
                    item.id ??
                    item.itemName?.trim().toLowerCase();

                  const price = Number(
                    item.itemPrice ?? item.price ?? 0
                  );

                  return (
                    <div
                      key={itemId}
                      className="rounded-2xl border border-zinc-200 bg-white/70 p-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold text-zinc-900">
                            {item.itemName}
                          </h2>

                          <p className="mt-1 text-sm text-zinc-500">
                            ₹{price} each
                          </p>
                        </div>

                        <p className="shrink-0 text-lg font-semibold text-zinc-900">
                          ₹{price * item.quantity}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center rounded-full border border-zinc-200 bg-white">
                          <button
                            onClick={() => decreaseQuantity(itemId)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-zinc-100"
                          >
                            −
                          </button>

                          <span className="w-10 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseQuantity(itemId)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-zinc-100"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(itemId)}
                          className="text-sm font-medium text-red-500 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div className="my-8 border-t border-zinc-200 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-zinc-500">
                    <span>Delivery</span>

                    <span>
                      {deliveryFee === 0
                        ? "FREE"
                        : `₹${deliveryFee}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-200 pt-4">
                    <span className="text-lg font-medium text-zinc-600">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-zinc-900">
                      ₹{total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {paymentError}
                </div>
              )}

              {/* Slide To Pay */}
              <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-center">
                <SlideCommit
                  label="Slide to pay"
                  doneLabel="Paid"
                  errorLabel="Payment failed"
                  onConfirm={handlePayment}
                  onDone={() => console.log("paid")}
                  onError={(reason) => console.log(reason)}
                  trackColor="#262626"
                  handleColor="#f5f5f5"
                  successColor="#22c55e"
                  dangerColor="#e5484d"
                  width={280}
                  height={56}
                  radius={28}
                  speed={50}
                  returnBounce={0.38}
                  landingDip={0.026}
                  holdMs={1500}
                  outcome="resolve"
                  latency={1200}
                  disabled={false}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;