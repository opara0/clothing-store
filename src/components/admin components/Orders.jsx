import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../../../supabase'

const statusStyles = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}

export default function Orders() {
    const [orders, setOrders] = useState([])
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function loadOrders() {
            setLoading(true)
            setError('')
            const { data, error: loadError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })

            if (loadError) setError(loadError.message)
            else setOrders(data || [])
            setLoading(false)
        }
        loadOrders()
    }, [])

    const visibleOrders = orders.filter(order => {
        const customer = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`
        const matchesStatus = status === 'all' || order.status === status
        const matchesSearch = `${order.id} ${customer} ${order.phone || ''}`
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        return matchesStatus && matchesSearch
    })

    const tabs = [
        ['all', 'All', orders.length],
        ['pending', 'Pending', orders.filter(order => order.status === 'pending').length],
        ['processing', 'Processing', orders.filter(order => order.status === 'processing').length],
        ['shipped', 'Shipped', orders.filter(order => order.status === 'shipped').length],
        ['delivered', 'Delivered', orders.filter(order => order.status === 'delivered').length],
        ['cancelled', 'Cancelled', orders.filter(order => order.status === 'cancelled').length],
    ]

    return (
        <main className="min-h-screen bg-white p-3 text-slate-900 sm:p-5 lg:p-6">
            <h1 className="text-3xl font-semibold">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">View and manage all store orders</p>

            <div className="mt-6 mb-4 flex h-11 items-center gap-3 rounded-md border border-slate-200 bg-white px-3">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm text-slate-500" />
                <input
                    type="search"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search orders by customer, phone or order number..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
            </div>

            {error && <p role="alert" className="mb-3 text-sm text-red-300">{error}</p>}

            <div className="mb-5 flex gap-4 overflow-x-auto border-b border-slate-200 sm:gap-6">
                {tabs.map(([value, label, count]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setStatus(value)}
                        className={`shrink-0 border-b-2 px-1 pb-3 text-sm ${status === value
                            ? 'border-slate-900 text-slate-900'
                            : 'border-transparent text-slate-500'
                            }`}
                    >
                        {label} <span className="ml-1 text-xs">{count}</span>
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
                    <thead className="border-b border-slate-200">
                        <tr className="text-xs text-slate-500">
                            <th className="w-[12%] px-4 py-3 font-medium">Order</th>
                            <th className="w-[16%] px-4 py-3 font-medium">Customer</th>
                            <th className="w-[18%] px-4 py-3 font-medium">Items</th>
                            <th className="w-[12%] px-4 py-3 font-medium">Total</th>
                            <th className="w-[14%] px-4 py-3 font-medium">Status</th>
                            <th className="w-[16%] px-4 py-3 font-medium">Date</th>
                            <th className="w-[12%] px-4 py-3 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">Loading orders...</td></tr>
                        ) : visibleOrders.length === 0 ? (
                            <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">No orders found</td></tr>
                        ) : visibleOrders.map(order => {
                            const items = Array.isArray(order.items) ? order.items : []
                            const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
                            const firstItem = items[0]

                            return (
                                <tr key={order.id} className="border-b border-slate-100 text-sm last:border-0">
                                    <td className="px-4 py-3 font-medium">#{order.id}</td>
                                    <td className="px-4 py-3">
                                        {order.customer_first_name} {order.customer_last_name}
                                    </td>
                                    <td className="px-4 py-3">
                                        {firstItem ? (
                                            <div className="flex h-11 items-center gap-2">
                                                {firstItem.imageUrl ? (
                                                    <img
                                                        src={firstItem.imageUrl}
                                                        alt=""
                                                        className="h-10 w-10 shrink-0 rounded object-contain"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 shrink-0 rounded bg-slate-700" />
                                                )}
                                                {itemCount > 1 && (
                                                    <span className="text-xs text-slate-500">+{itemCount - 1}</span>
                                                )}
                                            </div>
                                        ) : '0 items'}
                                    </td>
                                    <td className="px-4 py-3">₦{Number(order.subtotal || 0).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-1 text-xs ${statusStyles[order.status] || statusStyles.pending}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-slate-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/orders/${order.id}`}
                                                className="rounded border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
                                            >
                                                View
                                            </Link>
                                            <button type="button" aria-label="More order actions" className="text-slate-500">
                                                <FontAwesomeIcon icon={faEllipsis} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {!loading && (
                <p className="mt-3 text-xs text-slate-500">
                    Showing {visibleOrders.length} of {orders.length} orders
                </p>
            )}
        </main>
    )
}
