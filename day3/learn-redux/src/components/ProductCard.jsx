import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cart/cartSlice";

function ProductCard({ product }) {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col gap-3 items-center justify-center mt-10 border-5 border-gray-300 rounded-lg p-5">
      <h1>{product.name}</h1>

      <p>₹{product.price}</p>

      <button onClick={() => dispatch(addToCart(product))} className="mt-3">
        Add to cart
      </button>
    </div>
  );
}

export default ProductCard;
