import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShieldHalved, faTruckFast, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { getProducts } from '../../data'
import { getProductImageUrl } from './Homepage'
import { useNavigate } from 'react-router'

export default function Cart({ cartid, updateCartQuantity }) {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const productcount = cartid.length

    useEffect(() => {
        async function getcart() {
            try {
                const data = await getProducts()
                setProducts(data)
            } catch (error) {
                alert(error)

            }
        }

        getcart()
    }, [])
    const product = products
        .filter((item) => cartid.includes(item.id))
        .map((item) => {
            const quantity = cartid.filter((cartProductId) => cartProductId === item.id).length
            return {
                ...item,
                quantity,
                imageUrl: getProductImageUrl(item.image_url),
            }
        })
    const subtotal = product.reduce(
        (sum, item) => sum + (Number(item.price) || 0) * item.quantity,
        0,
    )

    return (
        <main className="p-3 text-slate-700">
            <h1>Your Cart <span className="font-light">({productcount} items)</span></h1>
            <main className="flex justify-between gap-3 text-white">
                <section className="flex flex-col justify-between gap-2 w-2/4">
                    {product.map((product) => {
                        const quantity = cartid.filter(id => id === product.id).length
                        return (
                            <div
                                key={product.id}
                                className="flex w-full items-center justify-between gap-4 rounded-2xl bg-[#181818] p-3"
                            >
                                <div className="flex items-center gap-2">
                                    <img src={product.imageUrl} className="size-24 rounded" alt={product.name} />
                                    <div className="flex flex-col justify-around gap-3 text-sm ">
                                        <h2>{product.name}</h2>
                                        <p>₦{product.price}</p>
                                        <h3>Quantity: {quantity}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2 rounded-4xl border p-1">
                                    <button
                                        type="button"
                                        aria-label={`Decrease ${product.name} quantity`}
                                        onClick={() => updateCartQuantity(product.id, -1)}
                                        className="cursor-pointer px-2"
                                    >
                                        -
                                    </button>
                                    <span>{quantity}</span>
                                    <button
                                        type="button"
                                        aria-label={`Increase ${product.name} quantity`}
                                        onClick={() => updateCartQuantity(product.id, 1)}
                                        className="cursor-pointer px-2"
                                    >
                                        +
                                    </button>
                                </div>
                                <div>
                                    <FontAwesomeIcon icon={faTrashCan} className="text-white" />
                                </div>
                            </div>
                        )
                    })}
                </section>
                <section className="flex w-4/9 flex-col items-center justify-between rounded-2xl bg-[#181818] p-5 text-white">
                    <h2 className="mb-3">Order Summary</h2>
                    <div className="flex w-full flex-row justify-between text-sm font-light">
                        <p>Subtotal ({productcount} items)</p>
                        <p>₦{subtotal}</p>
                    </div>
                    {/* {/* <div className="flex w-full flex-row justify-between text-sm font-light">
                            <p>Delivery</p>
                            <p>₦2500</p>
                        </div> */}
                    {/* <hr className="my-2 w-full text-slate-500" />
                        <div className="mb-4 mx-3 my-1 font-bold flex w-full flex-row justify-between text-sm ">
                            <h1>Total</h1>
                            <h1>₦140,000</h1>
                        </div>  */}
                    <button
                        onClick={() => navigate('/checkout', { state: { product, subtotal } })}
                        className="mb-2 w-full cursor-pointer rounded bg-white px-8 py-2 text-sm text-black"
                    >
                        Proceed to checkout
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="mb-2 w-full cursor-pointer rounded border border-white bg-[#111111] px-8 py-2 text-sm"
                    >
                        Continue Shopping
                    </button>
                    <hr className="my-2 w-full text-slate-500" />
                    <div className="flex flex-col items-start">
                        <div className="mb-2 flex items-center justify-start gap-3">
                            <FontAwesomeIcon icon={faTruckFast} className="text-lg" aria-hidden="true" />
                            <div className="flex flex-col text-sm">
                                <h3>Fast Delivery</h3>
                                <p className="font-light">2-5 business days</p>
                            </div>
                        </div>
                        <div className="mb-2 flex items-center justify-start gap-3">
                            <FontAwesomeIcon icon={faShieldHalved} className="text-lg" aria-hidden="true" />
                            <div className="flex flex-col text-sm">
                                <h3>Secure Payment</h3>
                                <p className="font-light">your payment is protected</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </main>
    )
}