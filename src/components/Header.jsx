import { useState } from "react"
import { useNavigate } from "react-router"

export default function Header({ cartButtonRef, cartItemCount, cartAnnouncement, setsearchterm, searchterm }) {
    const navigate = useNavigate()

    const [toggle, settoggle] = useState(true)

    function toggling() {
        if (toggle === true) {
            settoggle(false)
        } else {
            settoggle(true)
        }
    }
    return (
        <>
            <main className="sticky top-0 z-30 w-full bg-white p-3 sm:p-5">
                <header className="mb-5 flex flex-row items-center justify-between md:mb-10">
                    <div className="flex flex-row gap-3">
                        <h1 className="text-black font-bold text-sm">WOMEN</h1>
                        <h1 className="text-black font-bold text-sm">MEN</h1>
                    </div>
                    <h1 className="text-black font-bold text-xl cursor-pointer"
                        onClick={() => navigate('/')}
                    >AVANTA</h1>
                    {toggle && (<input type="text" value={searchterm}
                        onChange={(e) => setsearchterm(e.target.value)}
                        className="p-1 rounded-2xl " placeholder="search" />)}
                    <div className="flex flex-row gap-3">
                        <h1 className="text-sm font-light"
                            onClick={toggling}
                        >SEARCH</h1>

                        <button
                            ref={cartButtonRef}
                            type="button"
                            aria-label={`Cart, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`}
                            onClick={() => navigate('/cart')}
                            className="flex cursor-pointer flex-row items-center gap-1 text-sm font-light"
                        >
                            CART
                            <span
                                aria-hidden="true"
                                className="flex size-5 items-center justify-center rounded-full bg-black text-sm font-light leading-none text-white"
                            >
                                {cartItemCount}
                            </span>
                        </button>
                        <span className="sr-only" aria-live="polite" aria-atomic="true">
                            {cartAnnouncement}
                        </span>

                    </div>
                </header>
            </main>
        </>
    )
}