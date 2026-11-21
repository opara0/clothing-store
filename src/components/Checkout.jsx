import { useLocation } from "react-router"

export default function Checkout() {
    const { state } = useLocation()
    const { product = [], subtotal = 0 } = state ?? {}
    return (
        <>
            <main className="p-5  ">
                <h1 className="mb-4 text-4xl">CHECKOUT</h1>
                <section className="flex justify-between ">
                    <div className="flex flex-col justify-between w-2/4 gap-3">
                        <div className="flex justify-between gap-4 ">
                            <div className="flex flex-col">
                                <h3>First Name</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>
                            <div className="flex flex-col">
                                <h3>Last Name</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>

                        </div>
                        <div className="flex flex-col" >
                            <h3>Address</h3>
                            <input type="text"
                                className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none  w-full" />
                        </div>
                        <div className="flex justify-between gap-4">
                            <div className="flex flex-col">
                                <h3>City</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>
                            <div className="flex flex-col">
                                <h3>Country</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>

                        </div>
                        <div className="flex justify-between gap-4">
                            <div className="flex flex-col">
                                <h3>Postal Code</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>
                            <div className="flex flex-col">
                                <h3>Phone Number</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none" />
                            </div>

                        </div>
                    </div>
                    <section className="w-2/5 flex flex-col justify-center gap-5">

                        <section className="flex flex-col justify-between gap-3">
                            {product.map((item) => (
                                <div key={item.id} className="flex justify-between gap-3 bg-black text-white p-4 rounded-2xl">
                                    <img src={item.imageUrl} alt={item.name}
                                        className="size-24" />
                                    <p>{item.name}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>₦{item.price}</p>
                                </div>
                            ))}
                        </section>


                        <div className="flex flex-col ">
                            <div className="flex justify-between"><p>Subtotal</p><p> ₦{subtotal}</p></div>
                        </div>
                        <button className="w-full bg-black text-white p-2">Checkout</button>
                    </section>
                </section>
            </main>
        </>
    )
}