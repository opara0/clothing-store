import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { useEffect, useState } from 'react'
import { supabase } from '../../supabase'

export default function Backroom() {
    const [session, setSession] = useState(null)
    const [authLoading, setAuthLoading] = useState(true)
    const [adminLoading, setAdminLoading] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        let active = true
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (!active) return
            setSession(nextSession)
            setAuthError('')
            setAuthLoading(false)
        })

        supabase.auth.getSession()
            .then(({ data, error }) => {
                if (!active) return
                if (error) setAuthError('Could not check your sign-in status. Please refresh and try again.')
                setSession(data.session)
                setAuthLoading(false)
            })
            .catch((error) => {
                console.error('Could not check admin sign-in status:', error)
                if (!active) return
                setAuthError('Could not check your sign-in status. Please refresh and try again.')
                setAuthLoading(false)
            })

        return () => {
            active = false
            subscription.unsubscribe()
        }
    }, [])

    useEffect(() => {
        let active = true

        async function checkAdminAccess() {
            if (!session) {
                setIsAdmin(false)
                setAdminLoading(false)
                return
            }

            setAdminLoading(true)
            setAuthError('')
            try {
                const { data, error } = await supabase.rpc('is_admin')
                if (!active) return
                if (error) throw error
                setIsAdmin(data === true)
            } catch (error) {
                console.error('Could not verify admin access:', error)
                setIsAdmin(false)
                setAuthError('Could not verify admin access. Check that the admin security setup is installed.')
            } finally {
                if (active) setAdminLoading(false)
            }
        }

        checkAdminAccess()
        return () => {
            active = false
        }
    }, [session])

    async function signIn(event) {
        event.preventDefault()
        setSubmitting(true)
        setAuthError('')

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) setAuthError(error.message)
        } catch (error) {
            console.error('Could not sign in admin:', error)
            setAuthError('Could not sign in. Please check your connection and try again.')
        } finally {
            setSubmitting(false)
        }
    }

    async function signOut() {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
        } catch (error) {
            console.error('Could not sign out admin:', error)
            setAuthError('Could not sign out. Please try again.')
        }
    }

    if (authLoading || adminLoading) {
        return <main className="p-8" role="status">Checking admin access...</main>
    }

    if (!session || !isAdmin) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#111111] p-4 text-white">
                <form onSubmit={signIn} className="flex w-full max-w-sm flex-col gap-4 rounded border border-slate-700 p-6">
                    <h1 className="text-2xl">Admin sign in</h1>
                    <label className="flex flex-col gap-1">
                        Email
                        <input
                            type="email"
                            autoComplete="username"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className="rounded bg-[#181818] p-2"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        Password
                        <input
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="rounded bg-[#181818] p-2"
                        />
                    </label>
                    {authError && <p role="alert" className="text-red-300">{authError}</p>}
                    {session && !isAdmin && (
                        <p role="alert">This account is signed in but does not have admin access.</p>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="cursor-pointer rounded bg-white p-2 text-black disabled:opacity-60"
                    >
                        {submitting ? 'Signing in...' : 'Sign in'}
                    </button>
                    {session && (
                        <button type="button" onClick={signOut} className="cursor-pointer underline">
                            Sign out
                        </button>
                    )}
                </form>
            </main>
        )
    }

    return <AdminDashboard onSignOut={signOut} error={authError} />
}

function AdminDashboard({ onSignOut, error }) {
    const [name, setname] = useState('')
    const [description, setdescription] = useState('')
    const [category, setcategory] = useState('')
    const [price, setprice] = useState('')
    const [stock, setstock] = useState('')
    const [image, setimage] = useState([]);

    function getimages(e) {
        const availableSlots = 4 - image.length
        const selectedFiles = Array.from(e.target.files || []).slice(0, availableSlots)
        if (selectedFiles.length === 0) return
        const newImages = selectedFiles.map(file => ({
            file,
            imageurl: URL.createObjectURL(file),
        }))

        setimage(currentimages => [...currentimages, ...newImages])
        e.target.value = ''
    }

    function removeImage(index) {
        const imageToRemove = image[index]
        if (!imageToRemove) return

        URL.revokeObjectURL(imageToRemove.imageurl)
        setimage(currentimages => currentimages.filter((item, currentIndex) => currentIndex !== index))
    }
    async function uploadImage(file) {
        const filePath = `${crypto.randomUUID()}-${file.name}`

        const { data, error } = await supabase.storage
            .from('public-image')
            .upload(filePath, file)

        if (error) throw error

        const { data: urlData } = supabase.storage
            .from('public-image')
            .getPublicUrl(data.path)

        return urlData.publicUrl
    }
    async function createproducts() {
        try {
            const imageUrls = await Promise.all(
                image.map(item => uploadImage(item.file))
            )

            const { error } = await supabase
                .from('products')
                .insert([
                    {
                        name,
                        description,
                        category,
                        price,
                        stock,
                        image_url: imageUrls[0] ?? null
                    }
                ])

            if (error) throw error

            window.alert('Successfully created product')
            setname('')
            setdescription('')
            setcategory('')
            setprice('')
            setstock('')
            image.forEach(item => URL.revokeObjectURL(item.imageurl))
            setimage([])
        } catch (error) {
            console.error('Failed to create product:', error)
            window.alert(error.message || 'Failed to create product')
        }
    }
    return (
        <>
            <main className="flex min-h-screen w-full bg-[#181818] text-white font-light">
                <aside className="flex w-32 shrink-0 flex-col border-r border-slate-700 bg-[#111111] p-3">
                    <h1 className="m-7">ADMIN</h1>
                    <button type="button" onClick={onSignOut} className="mb-3 cursor-pointer text-left underline">
                        Sign out
                    </button>
                    {error && <p role="alert" className="px-2 text-sm text-red-300">{error}</p>}
                    <div className="mt-5 flex flex-col items-start gap-1 justify-center">
                        <div className="focus:bg-[#121321] hover:brightness-50 hover:border-l m-1 flex w-full flex-row items-center gap-2 font-light">
                            <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 8h14l1 13H4L5 8Z" />
                                <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                            </svg>
                            Products
                        </div>
                        <div className="focus:bg-[#121321] hover:brightness-50 hover:border-l m-1 flex w-full flex-row items-center gap-2 font-light">
                            <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 7 9-4 9 4v10l-9 4-9-4V7Z" />
                                <path d="m3 7 9 4 9-4M12 11v10M7.5 5l9 4" />
                            </svg>
                            Orders
                        </div>
                        <hr className="w-4/5 bg-slate-500" />
                        <div className="focus:bg-[#121321] hover:brightness-50 hover:border-l m-1 flex w-full flex-row items-center gap-2 font-light">
                            <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 4h6v6M20 4l-9 9" />
                                <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
                            </svg>
                            View Store
                        </div>

                    </div>
                </aside>
                <section className="min-w-0 flex-1 p-8 bg-[#111111]">
                    <h2 className="text-4xl font-light mb-2">Create Product</h2>
                    <p className="font-extralight">Add a new product to your store</p>
                    <hr className="w-5/5 text-slate-500 my-3" />
                    <section className="flex">
                        <div className="flex flex-col p-3  gap-2">
                            <h1>Product Images</h1>
                            <p>Upload multiple images</p>
                            <input type='file' accept='image/*' onChange={getimages} className="cursor-pointer text-center h-42 w-108 rounded border-dotted border-slate-300 border bg-[#181818] flex flex-col justify-center">

                            </input>
                            <span>  Drag & Drop images here  or click to upload</span>
                            <p className="text-lg">max size of 50mb per image</p>
                            <div className="flex flex-row gap-2">

                                {image.map((item, index) => (
                                    <div key={item.imageurl} className="relative size-24 shrink-0">
                                        <img src={item.imageurl} alt={`Product image ${index + 1}`} className="size-full rounded bg-black object-cover" />
                                        <div className="absolute left-1 top-1 z-10 size-5 bg-black text-center">{index + 1}</div>
                                        <button
                                            type="button"
                                            aria-label={`Remove product image ${index + 1}`}
                                            onClick={() => removeImage(index)}
                                            className="absolute right-1 top-1 z-10 size-5 cursor-pointer bg-black text-center"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                ))}



                            </div>
                        </div>

                    </section>
                    <section className="flex flex-col gap-2 pt-3 text-sm font-extralight">
                        <hr className="w-5/5 text-slate-500 my-3 flex flex-row  " />
                        <h1>Product Details</h1>
                        <p className='text-sm font-extralight'>Product Name</p>
                        <input

                            value={name}
                            onChange={(e) => setname(e.target.value)}
                            className="bg-[#181818] rounded w-5/5 p-2" type='text' placeholder='e.g classic blazer'></input>
                        <p>Description</p>
                        <input
                            value={description}
                            onChange={(e) => setdescription(e.target.value)}
                            className="bg-[#181818] rounded w-5/5 h-10 p-2" type='text' placeholder='describe the product '></input>
                        <p>Category</p>
                        <input
                            value={category}
                            onChange={(e) => setcategory(e.target.value)}
                            className="bg-[#181818] rounded w-3/5 p-2" type='text' placeholder='select category'></input>
                        <p>Price</p>
                        <input
                            value={price}
                            onChange={(e) => setprice(e.target.value)}
                            className="bg-[#181818] rounded w-3/5 p-2" type='number' placeholder='e.g 24000'></input>
                        <p>Stock Quantity</p>
                        <input
                            value={stock}
                            onChange={(e) => setstock(e.target.value)}
                            className="bg-[#181818] rounded w-3/5 p-2" type='number' placeholder='e.g 10'></input>
                    </section>
                    <hr className="w-5/5 text-slate-500 my-3 flex flex-row  " />
                    <div className="flex justify-end gap-2">
                        <button className="cursor-pointer rounded p-3 border text-center">Save Draft</button>
                        <button
                            onClick={createproducts}
                            className="cursor-pointer rounded p-3 border bg-white text-black text-center">Publish Product</button>
                    </div>

                </section>
            </main>
        </>
    )
}