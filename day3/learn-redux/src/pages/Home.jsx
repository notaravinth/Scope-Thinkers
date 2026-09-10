import { products } from "../data";
import ProductCard from "../components/ProductCard";

function Home() {
  return (
    <div className="grid grid-cols-2 gap-4 text-center align-center justify-center mt-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default Home;
