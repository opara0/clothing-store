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
                <header className="mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-3 md:mb-10">
                    <div className="order-1 flex flex-row gap-2 sm:gap-3">
                        <h1 className="text-[10px] font-bold text-black sm:text-sm">WOMEN</h1>
                        <h1 className="text-[10px] font-bold text-black sm:text-sm">MEN</h1>
                    </div>
                    <h1 className="order-2 cursor-pointer text-lg font-bold text-black sm:text-xl"
                        onClick={() => navigate('/')}
                    >AVANTA</h1>
                    {toggle && (<input type="text" value={searchterm}
                        onChange={(e) => setsearchterm(e.target.value)}
                        id="site-search"
                        className="order-4 w-full basis-full rounded-2xl p-1 md:order-3 md:w-32 md:basis-auto"
                        placeholder="search" />)}
                    <div className="order-3 flex flex-row items-center gap-2 sm:gap-3 md:order-4">
                        <button type="button" aria-expanded={toggle} aria-controls="site-search"
                            className="text-xs font-light sm:text-sm"
                            onClick={toggling}
                        >SEARCH</button>

                        <button
                            ref={cartButtonRef}
                            type="button"
                            aria-label={`Cart, ${cartItemCount} ${cartItemCount === 1 ? 'item' : 'items'}`}
                            onClick={() => navigate('/cart')}
                            className="flex cursor-pointer flex-row items-center gap-1 text-xs font-light sm:text-sm"
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