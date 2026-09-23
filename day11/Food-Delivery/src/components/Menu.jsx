import React, { useEffect, useState } from "react";
import FlipCard from "./react-bits/FlipCard";

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch("/api/Restaurant/items");

        if (!response.ok) {
          throw new Error("Failed to fetch menu");
        }

        const data = await response.json();

        // Remove duplicate dishes by item name
        const uniqueItems = Array.from(
          new Map(
            data.map((item) => [
              item.itemName?.trim().toLowerCase(),
              item,
            ])
          ).values()
        );

        setMenuItems(uniqueItems);
      } catch (error) {
        console.error(error);
        setError("Unable to load the menu.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const addToCart = (item) => {
    console.log("Added to cart:", item);
  };

  const indianFoodKeywords = [
    "biryani",
    "dosa",
    "idli",
    "vada",
    "sambar",
    "paneer",
    "butter chicken",
    "chicken tikka",
    "tikka masala",
    "naan",
    "roti",
    "paratha",
    "parotta",
    "korma",
    "kofta",
    "curry",
    "masala",
    "tandoori",
    "tandoor",
    "samosa",
    "pakora",
    "pakoda",
    "chaat",
    "pav bhaji",
    "chole",
    "chana",
    "rajma",
    "dal",
    "dal makhani",
    "palak",
    "aloo",
    "gobi",
    "haleem",
    "fish amritsari",
    "fish curry",
    "mutton",
    "keema",
    "vindaloo",
    "thali",
  ];

  const indianDessertKeywords = [
    "gulab jamun",
    "jalebi",
    "rasmalai",
    "rasgulla",
    "kheer",
    "kulfi",
    "barfi",
    "burfi",
    "ladoo",
    "laddu",
    "halwa",
    "gajar halwa",
    "soan papdi",
    "sandesh",
    "peda",
    "payasam",
    "sheer korma",
    "shahi tukda",
    "malpua",
    "mysore pak",
    "modak",
  ];

  const getCategory = (item) => {
    const name = item.itemName?.toLowerCase() || "";
    const description =
      item.itemDescription?.toLowerCase() || "";

    const text = `${name} ${description}`;

    if (
      indianDessertKeywords.some((keyword) =>
        text.includes(keyword)
      )
    ) {
      return "dessert";
    }

    if (
      indianFoodKeywords.some((keyword) =>
        text.includes(keyword)
      )
    ) {
      return "food";
    }

    return null;
  };

  const indianFood = menuItems.filter(
    (item) => getCategory(item) === "food"
  );

  const indianDesserts = menuItems.filter(
    (item) => getCategory(item) === "dessert"
  );

  const renderCard = (item) => (
    <div
      key={item.itemID}
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

      <button
        onClick={() => addToCart(item)}
        className="mt-4 w-full rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-zinc-800 active:translate-y-0"
      >
        Add to Cart
      </button>
    </div>
  );

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