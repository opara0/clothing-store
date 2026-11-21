import { useLocation } from "react-router"

export default function Checkout() {
    const { state } = useLocation()
    const { product = [], subtotal = 0 } = state ?? {}
    return (
        <>
            <main className="mx-auto w-full max-w-7xl p-4 sm:p-5">
                <h1 className="mb-4 text-3xl sm:text-4xl">CHECKOUT</h1>
                <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
                    <div className="flex w-full flex-col gap-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex min-w-0 flex-col">
                                <h3>First Name</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <h3>Last Name</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>

                        </div>
                        <div className="flex flex-col" >
                            <h3>Address</h3>
                            <textarea
                                rows={3}
                                className="mt-1 min-h-20 w-full resize-y border-b border-slate-500 focus:border-b-2 focus:border-black focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex min-w-0 flex-col">
                                <h3>City</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <h3>Country</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>

                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex min-w-0 flex-col">
                                <h3>Postal Code</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <h3>Phone Number</h3>
                                <input type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none" />
                            </div>

                        </div>
                    </div>
                    <section className="flex w-full flex-col gap-5">

                        <section className="flex flex-col justify-between gap-3">
                            {product.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-black p-3 text-white sm:gap-4 sm:p-4">
                                    <img src={item.imageUrl} alt={item.name}
                                        className="size-20 shrink-0 rounded bg-white object-contain p-1 sm:size-24" />
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 break-words text-sm font-medium">{item.name}</p>
                                        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
                                            <p>Quantity: {item.quantity}</p>
                                            <p className="whitespace-nowrap">₦{item.price}</p>
                                        </div>
                                    </div>
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