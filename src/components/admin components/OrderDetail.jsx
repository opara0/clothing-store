import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faArrowLeft,
    faCheck,
    faCreditCard,
    faEnvelope,
    faLocationDot,
} from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../../../supabase'

const steps = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderDetail() {
    const { id } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadOrder() {
            const { data, error: loadError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', id)
                .single()

            if (loadError) setError(loadError.message)
            else setOrder(data)
            setLoading(false)
        }
        loadOrder()
    }, [id])

    async function updateStatus(event) {
        const status = event.target.value
        setSaving(true)
        setError('')
        const { error: updateError } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)

        if (updateError) setError(updateError.message)
        else setOrder(current => ({ ...current, status }))
        setSaving(false)
    }

    if (loading) {
        return         <main className="min-h-screen bg-white p-3 text-slate-900 sm:p-5 lg:p-6">Loading order...</main>
    }

    if (!order) {
        return (
            <main className="min-h-screen bg-white p-3 text-slate-900 sm:p-5 lg:p-6">
                <p role="alert">{error || 'Order not found.'}</p>
                <Link to="/admin/orders" className="mt-4 inline-block text-sm underline">
                    Back to Orders
                </Link>
            </main>
        )
    }

    const items = Array.isArray(order.items) ? order.items : []
    const statusIndex = steps.indexOf(order.status)

    return (
        <main className="min-h-screen bg-white p-3 text-slate-900 sm:p-5 lg:p-6">
            <Link to="/admin/orders" className="mb-4 inline-flex items-center gap-2 text-xs text-slate-500">
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Back to Orders</span>
            </Link>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
                        <span className={`rounded-full px-2 py-1 text-xs ${order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : order.status === 'delivered'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                        Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>

                <select
                    value={order.status}
                    onChange={updateStatus}
                    disabled={saving}
                    className="rounded border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm"
                    aria-label="Update order status"
                >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {error && <p role="alert" className="mb-4 text-xs text-red-600">{error}</p>}

            <section className="grid gap-3 md:grid-cols-3">
                <div className="flex min-h-20 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4">
                    <FontAwesomeIcon icon={faEnvelope} className="text-slate-500" />
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500">Customer</p>
                        <p className="truncate text-sm font-medium">
                            {order.customer_first_name} {order.customer_last_name}
                        </p>
                        <p className="truncate text-xs text-slate-500">{order.phone}</p>
                    </div>
                </div>

                <div className="flex min-h-20 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4">
                    <FontAwesomeIcon icon={faLocationDot} className="text-slate-500" />
                    <div className="min-w-0">
                        <p className="text-xs text-slate-500">Shipping Address</p>
                        <p className="text-sm">{order.address}</p>
                        <p className="text-xs text-slate-500">
                            {order.city}, {order.country} {order.postal_code}
                        </p>
                    </div>
                </div>

                <div className="flex min-h-20 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4">
                    <FontAwesomeIcon icon={faCreditCard} className="text-slate-500" />
                    <div>
                        <p className="text-xs text-slate-500">Payment Method</p>
                        <p className="text-sm">Payment on delivery</p>
                    </div>
                </div>
            </section>

            <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
                <section className="rounded-lg border border-slate-200 p-4">
                    <h2 className="mb-3 text-sm font-semibold">Items Ordered</h2>
                    <div className="flex flex-col">
                        {items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt=""
                                        className="h-12 w-12 shrink-0 rounded bg-slate-50 object-contain"
                                    />
                                ) : (
                                    <div className="h-12 w-12 shrink-0 rounded bg-slate-100" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">{item.name}</p>
                                    <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm">₦{Number(item.price).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm">
                        <strong>Total</strong>
                        <strong>₦{Number(order.subtotal).toLocaleString()}</strong>
                    </div>
                </section>

                <aside className="h-fit rounded-lg border border-slate-200 p-4">
                    <h2 className="mb-3 text-sm font-semibold">Order Summary</h2>
                    <dl className="space-y-3 text-xs">
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Subtotal</dt>
                            <dd>₦{Number(order.subtotal).toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-slate-500">Delivery Fee</dt>
                            <dd>No</dd>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-3 text-sm">
                            <dt className="font-semibold">Total</dt>
                            <dd className="font-semibold">₦{Number(order.subtotal).toLocaleString()}</dd>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-3">
                            <dt className="text-slate-500">Order Status</dt>
                            <dd className="rounded-full bg-green-100 px-2 py-0.5 text-green-700 capitalize">
                                {order.status}
                            </dd>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-3">
                            <dt className="text-slate-500">Delivered On</dt>
                            <dd className="text-right">
                                {order.status === 'delivered'
                                    ? new Date(order.created_at).toLocaleString()
                                    : 'Not delivered'}
                            </dd>
                        </div>
                    </dl>
                </aside>
            </div>

            <section className="mt-4 rounded-lg border border-slate-200 p-4">
                <h2 className="mb-4 text-sm font-semibold">Order Timeline</h2>
                {order.status === 'cancelled' ? (
                    <p className="text-sm text-red-600">This order was cancelled.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {steps.map((step, index) => {
                            const reached = statusIndex >= index
                            return (
                                <div key={step} className="grid grid-cols-[1.25rem_7rem_1fr] items-center text-xs">
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        className={`text-xs ${reached ? 'text-green-500' : 'text-slate-300'}`}
                                    />
                                    <span className="capitalize">
                                        {step === 'pending' ? 'Order Placed' : step}
                                    </span>
                                    <span className={reached ? 'text-slate-500' : 'text-slate-300'}>
                                        {reached
                                            ? step === 'pending'
                                                ? new Date(order.created_at).toLocaleString()
                                                : 'Status updated'
                                            : 'Pending'}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </section>
        </main>
    )
}
