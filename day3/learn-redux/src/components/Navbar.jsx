import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
function Navbar() {
  const items = useSelector((state) => state.cart.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  return (
    <nav className="flex flex-wrap justify-between items-center p-5 border-5 bg-black text-white border rounded-full">
      <Link to="/">
        <h1 className="text-2xl font-bold hover:text-gray-300 transition duration-300 ease-in-out">
          My Store
        </h1>
      </Link>

      <Link
        to="/cart"
        className="flex items-center gap-2 hover:text-gray-300 transition duration-300 ease-in-out"
      >
        <span>Cart</span>

        <span className="flex items-center justify-center bg-white text-black rounded-full w-6 h-6 text-sm font-bold">
          {totalItems}
        </span>
      </Link>
    </nav>
  );
}

export default Navbar;
