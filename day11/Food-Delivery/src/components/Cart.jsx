import React from "react";
import SoftAurora from "./react-bits/SoftAurora";
import SlideCommit from "./react-bits/SlideCommit";

const Cart = () => {
  const cartItems = [
    {
      id: 1,
      name: "Hyderabadi Biryani",
      price: 280,
      quantity: 1,
    },
    {
      id: 2,
      name: "Butter Chicken",
      price: 320,
      quantity: 2,
    },
    {
      id: 3,
      name: "Gulab Jamun",
      price: 120,
      quantity: 1,
    },
  ];

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

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
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
              Your Order
            </p>

            <h1 className="text-4xl font-bold text-zinc-900">Your Cart</h1>
          </div>

          {/* Items */}
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white/70 p-5"
              >
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {item.name}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>

                <p className="text-lg font-semibold text-zinc-900">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="my-8 border-t border-zinc-200 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-zinc-600">Total</span>

              <span className="text-2xl font-bold text-zinc-900">₹{total}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-center">
            <SlideCommit
              label="Slide to pay"
              doneLabel="Paid"
              errorLabel="Payment failed"
              onConfirm={() => api.pay(order)}
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
        </div>
      </div>
    </div>
  );
};

export default Cart;
