import { useSelector, useDispatch } from 'react-redux'
import { removeFromCart, addToCart, removeItemFromCart  } from '../features/cart/cartSlice'

function Cart() {

    const items = useSelector(state => state.cart.items)
    const totalItems = items.reduce((total, item) => total + item.quantity, 0)

    const dispatch = useDispatch()

    return (
        <div className="flex flex-col gap-4 items-center justify-center mt-10">
            <h2>Cart</h2>
            <p>Items in cart: {totalItems}</p>
            {items.map(item => (
                <div key={item.id}>
                    <div className="flex-col gap-2 items-center justify-center mt-3 text-center">
                    <p>{item.name}</p>
                    <p>Number of items: {item.quantity}</p>
                    </div>
                    <div className="flex gap-2 items-center justify-center mt-3">
                    <button onClick={() =>dispatch(removeFromCart(item.id))}>
                        Remove
                    </button>
                    <button onClick={() => dispatch(addToCart(item))}>
                        +
                    </button>
                    <button onClick={()=> dispatch(removeItemFromCart(item.id))}>
                        -
                    </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Cart