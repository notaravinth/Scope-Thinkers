import { useState } from 'react'

const App = () => {

    const [products, setProducts] = useState([])

    const getProducts = async () => {

        const response = await fetch('https://fakestoreapi.com/products')
        const data = await response.json()

        setProducts(data)
    }

    getProducts()

    return (
        <>
            <div className="min-h-screen p-5 mt-40">

                <div className="text-center text-white py-20">

                    <h1 className="text-5xl font-bold">
                        Welcome to Our Store
                    </h1>

                    <p className="text-xl mt-5 text-gray-300">
                        Find everything you need, all in one place.
                    </p>

                    <p className="mt-3 text-gray-400">
                        Browse our collection of clothing, electronics,
                        jewelry and more.
                    </p>

                    <a
                        href="#products"
                        className="inline-block bg-white text-gray-900 px-6 py-3 rounded-lg mt-7 font-bold hover:bg-gray-200"
                    >
                        Explore Products
                    </a>

                </div>


                <h2
                    id="products"
                    className="text-white text-3xl font-bold text-center mt-70"
                >
                    Our Products
                </h2>

                <p className="text-white text-center mt-2">
                    Find your favorite products here
                </p>


                <div className="grid grid-cols-5 gap-5 mt-5">

                    {products.map((product) => (

                        <div
                            className="bg-white p-5 rounded-lg flex flex-col items-center justify-center hover:scale-105 duration-300"
                            key={product.id}
                        >

                            <img
                                src={product.image}
                                className="w-40 h-40 object-contain"
                            />

                            <h2 className="font-bold text-center mt-3">
                                {product.title}
                            </h2>

                            <p className="mt-2">
                                ${product.price}
                            </p>

                        </div>

                    ))}

                </div>

            </div>
        </>
    )
}

export default App
