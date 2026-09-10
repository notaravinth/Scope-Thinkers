import { products } from './data'
import ProductCard from './components/ProductCard'
import Cart from './components/Cart'

function App() {

    return (
        <div>
          <div className="grid grid-cols-2 gap-4 items-center justify-center text-center mt-10">
            {products.map((product)=>(
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Cart/>
        </div>
    )
}

export default App