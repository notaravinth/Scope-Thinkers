import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import FlipCard from "./react-bits/FlipCard";
import { useCart } from "../context/CartContext";
import { db } from "../firebase/firebase";

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const snapshot = await getDocs(collection(db, "menuItems"));

        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMenuItems(items);
      } catch (error) {
        console.error(error);
        setError("Unable to load the menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const indianFood = menuItems.filter(
    (item) => item.category === "food"
  );

  const indianDesserts = menuItems.filter(
    (item) => item.category === "dessert"
  );

  const getItemId = (item) =>
    item.itemID ?? item.id ?? item.itemName?.trim().toLowerCase();

  const getCartItem = (item) => {
    const itemId = getItemId(item);

    return cartItems.find(
      (cartItem) => getItemId(cartItem) === itemId
    );
  };

  const renderCard = (item) => {
    const cartItem = getCartItem(item);
    const quantity = cartItem?.quantity ?? 0;
    const itemId = getItemId(item);

    return (
      <div
        key={itemId}
        className="flex w-full max-w-[300px] flex-col items-center"
      >
        <FlipCard
          width={300}
          height={380}
          radius={22}
          background="#ffffff"
          color="#18181b"
          shadow
          glare
          hoverScale={1.03}
          tilt
          draggable
          front={
            <div className="flex h-full flex-col">
              <img
                src={item.imageUrl}
                alt={item.itemName}
                className="h-[220px] w-full rounded-t-[22px] object-cover"
              />

              <div className="flex flex-1 flex-col justify-between p-5">
                <h2 className="text-xl font-semibold">
                  {item.itemName}
                </h2>

                <p className="mt-3 text-lg font-semibold text-green-700">
                  ₹{item.itemPrice}
                </p>
              </div>
            </div>
          }
          back={
            <div className="flex h-full flex-col justify-between p-6">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-zinc-400">
                  Description
                </p>

                <h2 className="mb-4 text-2xl font-semibold">
                  {item.itemName}
                </h2>

                <p className="text-sm leading-6 text-zinc-500">
                  {item.itemDescription}
                </p>
              </div>

              <p className="text-lg font-semibold text-green-700">
                ₹{item.itemPrice}
              </p>
            </div>
          }
        />

        {quantity === 0 ? (
          <button
            onClick={() => addToCart(item)}
            className="mt-4 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-800 active:translate-y-0"
          >
            Add to Cart
          </button>
        ) : (
          <div className="mt-4 flex h-12 w-full items-center justify-between rounded-full bg-black px-2 text-white">
            <button
              onClick={() => decreaseQuantity(itemId)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:bg-zinc-800"
            >
              −
            </button>

            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold">
                {quantity}
              </span>

              <span className="text-[10px] text-zinc-400">
                in cart
              </span>
            </div>

            <button
              onClick={() => increaseQuantity(itemId)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:bg-zinc-800"
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <section
      id="menu"
      className="mb-30 mt-50 scroll-mt-28 px-6"
    >
      <h1 className="mb-16 text-center text-4xl font-bold tracking-tight">
        Browse Our Menu
      </h1>

      {loading && (
        <div className="flex justify-center py-20">
          <p className="text-lg text-zinc-500">
            Loading menu...
          </p>
        </div>
      )}

      {error && (
        <div className="flex justify-center py-20">
          <p className="text-lg text-red-500">
            {error}
          </p>
        </div>
      )}

      {!loading && !error && (
        <div className="mx-auto max-w-7xl">
          {/* INDIAN FOOD */}
          {indianFood.length > 0 && (
            <div className="mb-24">
              <div className="mb-10 text-center">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-green-600">
                  Main Course
                </p>

                <h2 className="text-3xl font-bold">
                  Indian Food
                </h2>
              </div>

              <div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {indianFood.map(renderCard)}
              </div>
            </div>
          )}

          {/* INDIAN DESSERTS */}
          {indianDesserts.length > 0 && (
            <div>
              <div className="mb-10 text-center">
                <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-amber-600">
                  Sweet Endings
                </p>

                <h2 className="text-3xl font-bold">
                  Indian Desserts
                </h2>
              </div>

              <div className="grid grid-cols-1 justify-items-center gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {indianDesserts.map(renderCard)}
              </div>
            </div>
          )}

          {indianFood.length === 0 &&
            indianDesserts.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-lg text-zinc-500">
                  No Indian dishes were found.
                </p>
              </div>
            )}
        </div>
      )}
    </section>
  );
};

export default Menu;