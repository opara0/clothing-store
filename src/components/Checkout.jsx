import { useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { supabase } from "../../supabase"

export default function Checkout() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { product = [], subtotal = 0 } = state ?? {}
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        country: '',
        postalCode: '',
        phone: '',
    })

    function updateField(event) {
        setForm(current => ({
            ...current,
            [event.target.name]: event.target.value,
        }))
    }

    async function placeOrder(event) {
        event.preventDefault()
        if (product.length === 0) {
            setError('Your cart is empty.')
            return
        }

        setSubmitting(true)
        setError('')

        const { data, error: insertError } = await supabase
            .from('orders')
            .insert([{
                customer_first_name: form.firstName.trim(),
                customer_last_name: form.lastName.trim(),
                address: form.address.trim(),
                city: form.city.trim(),
                country: form.country.trim(),
                postal_code: form.postalCode.trim(),
                phone: form.phone.trim(),
                items: product,
                subtotal,
                status: 'pending',
            }])
            .select('id')
            .single()

        if (insertError) {
            console.error('Could not create order:', insertError)
            setError(insertError.message)
            setSubmitting(false)
            return
        }

        window.alert(`Order #${data.id} placed successfully`)
        navigate('/')
    }
    return (
        <>
            <form onSubmit={placeOrder} className="mx-auto w-full max-w-7xl p-4 sm:p-5">
                <h1 className="mb-4 text-3xl sm:text-4xl">CHECKOUT</h1>
                <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
                    <div className="flex w-full flex-col gap-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex min-w-0 flex-col">
                                <h3>First Name</h3>
                                <input name="firstName" value={form.firstName} onChange={updateField} required type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <h3>Last Name</h3>
                                <input name="lastName" value={form.lastName} onChange={updateField} required type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>

                        </div>
                        <div className="flex flex-col" >
                            <h3>Address</h3>
                            <textarea
                                name="address" value={form.address} onChange={updateField} required
                                rows={3}
                                className="mt-1 min-h-20 w-full resize-y border-b border-slate-500 focus:border-b-2 focus:border-black focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex min-w-0 flex-col">
                                <h3>City</h3>
                                <input name="city" value={form.city} onChange={updateField} required type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <h3>Country</h3>
                                <input name="country" value={form.country} onChange={updateField} required type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>

                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex min-w-0 flex-col">
                                <h3>Postal Code</h3>
                                <input name="postalCode" value={form.postalCode} onChange={updateField} required type="text"
                                    className="mt-1 border-b-slate-500 border-b focus:border-b-2 focus:border-black focus:outline-none w-full" />
                            </div>
                            <div className="flex min-w-0 flex-col">
                                <h3>Phone Number</h3>
                                <input name="phone" value={form.phone} onChange={updateField} required type="tel"
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
                        {error && <p role="alert" className="text-red-600">{error}</p>}
                        <button type="submit" disabled={submitting} className="w-full bg-black p-2 text-white disabled:opacity-50">
                            {submitting ? 'Creating order...' : 'Checkout'}
                        </button>
                    </section>
                </section>
            </form>
        </>
    )
}