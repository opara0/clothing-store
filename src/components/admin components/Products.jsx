import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../../../supabase'

export default function Products() {
    const [products, setProducts] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [draft, setDraft] = useState(null)
    const [savingId, setSavingId] = useState(null)

    async function loadProducts() {
        setLoading(true)
        setError('')

        const { data, error: loadError } = await supabase
            .from('products')
            .select('id, name, category, price, stock, description, image_url')
            .order('name')

        if (loadError) {
            setError(loadError.message)
        } else {
            setProducts(data || [])
        }
        setLoading(false)
    }

    useEffect(() => {
        loadProducts()
    }, [])

    function startEditing(product) {
        setEditingId(product.id)
        setDraft({
            name: product.name || '',
            category: product.category || '',
            price: product.price ?? '',
            stock: product.stock ?? 0,
        })
    }

    async function saveProduct(productId) {
        setSavingId(productId)
        setError('')

        const { error: updateError } = await supabase
            .from('products')
            .update({
                name: draft.name.trim(),
                category: draft.category.trim(),
                price: Number(draft.price),
                stock: Number(draft.stock),
            })
            .eq('id', productId)

        if (updateError) {
            setError(updateError.message)
        } else {
            setProducts(current => current.map(product =>
                product.id === productId
                    ? {
                        ...product,
                        ...draft,
                        price: Number(draft.price),
                        stock: Number(draft.stock),
                    }
                    : product
            ))
            setEditingId(null)
            setDraft(null)
            window.dispatchEvent(new CustomEvent('products-updated'))
        }
        setSavingId(null)
    }

    async function deleteProduct(product) {
        if (!window.confirm(`Delete "${product.name}"?`)) return

        setError('')
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id)

        if (deleteError) {
            setError(deleteError.message)
            return
        }

        setProducts(current => current.filter(item => item.id !== product.id))
        window.dispatchEvent(new CustomEvent('products-updated'))
    }

    async function toggleStock(product) {
        const nextStock = Number(product.stock) > 0 ? 0 : 1
        setSavingId(product.id)
        setError('')

        const { error: updateError } = await supabase
            .from('products')
            .update({ stock: nextStock })
            .eq('id', product.id)

        if (updateError) {
            setError(updateError.message)
        } else {
            setProducts(current => current.map(item =>
                item.id === product.id
                    ? { ...item, stock: nextStock }
                    : item
            ))
            window.dispatchEvent(new CustomEvent('products-updated'))
        }
        setSavingId(null)
    }

    const visibleProducts = products.filter(product =>
        [product.name, product.category]
            .join(' ')
            .toLowerCase()
            .includes(search.trim().toLowerCase())
    )

    return (
        <main className="min-h-screen bg-[#111111] p-3 text-white sm:p-5 lg:p-6">
            <h1 className="text-3xl font-semibold">Products</h1>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="font-light">Manage your store products</p>
                <Link
                    to="/admin/add-product"
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#181818] px-4 py-2.5 text-sm text-white hover:opacity-50 sm:w-auto"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    <span>Add product</span>
                </Link>
            </div>

            <div className="my-5 flex w-full items-center gap-3 rounded-md border border-slate-700 bg-[#181818] px-3 py-2.5">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="text-slate-500" />
                <input
                    type="search"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-transparent text-sm outline-none"
                />
            </div>

            {error && (
                <p role="alert" className="mb-3 rounded border border-red-300 p-3 text-red-700">
                    {error}
                </p>
            )}

            <div className="overflow-x-auto rounded-lg border border-slate-700 bg-[#181818] shadow-sm">
                <table className="w-full min-w-[760px] border-collapse text-left">
                    <thead className="border-b border-slate-700">
                        <tr>
                            <th className="p-4 text-xs font-medium text-slate-400">Product</th>
                            <th className="p-4 text-xs font-medium text-slate-400">Price</th>
                            <th className="p-4 text-xs font-medium text-slate-400">Stock</th>
                            <th className="p-4 text-xs font-medium text-slate-400">Status</th>
                            <th className="p-4 text-right text-xs font-medium text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center">Loading products...</td>
                            </tr>
                        ) : visibleProducts.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-6 text-center">No products found.</td>
                            </tr>
                        ) : visibleProducts.map(product => {
                            const isEditing = editingId === product.id
                            const stock = isEditing ? Number(draft.stock) : Number(product.stock)

                            return (
                                <tr key={product.id} className="border-b border-slate-700 last:border-0">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt=""
                                                    className="size-12 rounded object-cover"
                                                />
                                            ) : (
                                                <div className="size-12 rounded bg-slate-700" />
                                            )}
                                            {isEditing ? (
                                                <div className="flex flex-col gap-1">
                                                    <input
                                                        value={draft.name}
                                                        onChange={event => setDraft({ ...draft, name: event.target.value })}
                                                        className="rounded border border-slate-600 bg-[#111111] px-2 py-1 text-white"
                                                        aria-label="Product name"
                                                    />
                                                    <input
                                                        value={draft.category}
                                                        onChange={event => setDraft({ ...draft, category: event.target.value })}
                                                        className="rounded border border-slate-600 bg-[#111111] px-2 py-1 text-white"
                                                        aria-label="Product category"
                                                    />
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    {product.category && (
                                                        <p className="text-sm text-slate-400">{product.category}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                value={draft.price}
                                                onChange={event => setDraft({ ...draft, price: event.target.value })}
                                                className="w-24 rounded border border-slate-600 bg-[#111111] px-2 py-1 text-white"
                                                aria-label="Product price"
                                            />
                                        ) : `₦${Number(product.price).toLocaleString()}`}
                                    </td>
                                    <td className="p-3">
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                min="0"
                                                value={draft.stock}
                                                onChange={event => setDraft({ ...draft, stock: event.target.value })}
                                                className="w-20 rounded border border-slate-600 bg-[#111111] px-2 py-1 text-white"
                                                aria-label="Product stock"
                                            />
                                        ) : stock}
                                    </td>
                                    <td className="p-3">
                                        {isEditing ? (
                                            <span className={`rounded-full px-2 py-1 text-xs ${stock > 0
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => toggleStock(product)}
                                                disabled={savingId === product.id}
                                                className={`rounded-full px-2 py-1 text-xs disabled:opacity-50 ${stock > 0
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                    }`}
                                                aria-label={stock > 0
                                                    ? `Mark ${product.name} out of stock`
                                                    : `Mark ${product.name} in stock`
                                                }
                                            >
                                                {savingId === product.id
                                                    ? 'Updating...'
                                                    : stock > 0
                                                        ? 'In Stock'
                                                        : 'Out of Stock'}
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex justify-end gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => saveProduct(product.id)}
                                                        disabled={savingId === product.id || !draft.name.trim()}
                                                        className="rounded border border-slate-600 px-3 py-2 text-xs text-white disabled:opacity-50"
                                                    >
                                                        {savingId === product.id ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setEditingId(null)
                                                            setDraft(null)
                                                        }}
                                                        className="rounded border border-slate-600 px-3 py-2 text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditing(product)}
                                                        className="grid size-9 place-items-center rounded border border-slate-600 text-slate-200"
                                                        aria-label={`Edit ${product.name}`}
                                                    >
                                                        <FontAwesomeIcon icon={faPen} className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteProduct(product)}
                                                        className="grid size-9 place-items-center rounded border border-red-300 text-red-600"
                                                        aria-label={`Delete ${product.name}`}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="size-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {!loading && (
                <p className="mt-3 text-sm text-slate-400">
                    Showing {visibleProducts.length} of {products.length} products
                </p>
            )}
        </main>
    )
}
