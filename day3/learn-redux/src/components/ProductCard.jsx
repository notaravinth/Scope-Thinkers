import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";

function ProductCard({ product }) {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-row gap-5 items-center mt-10 border-5 border-gray-300 rounded-lg p-5">
      <img
        src={product.image}
        alt={product.name}
        className="w-32 h-32 object-cover"
      />

      <div className="flex flex-col gap-3">
        <h1 className="text-xl font-bold">{product.name}</h1>

        <p>{product.description}</p>

        <p>₹{product.price}</p>

        <button onClick={() => dispatch(addToCart(product))} className="mt-3">
          Add to cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
