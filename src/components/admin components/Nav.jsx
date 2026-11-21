import { Link, useLocation } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUpRightFromSquare, faBox, faCube, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

export default function Nav({ onSignOut, error }) {
    const location = useLocation()
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

    return (
        <aside className="fixed bottom-0 left-0 z-50 h-16 w-full border-t border-slate-800 bg-[#111111] md:static md:h-auto md:min-h-screen md:w-20 md:shrink-0 md:border-r md:border-t-0 lg:w-52">
            <h1 className="hidden px-5 py-5 text-sm font-semibold text-white lg:block">ADMIN</h1>
            <button type="button" onClick={onSignOut} title="Sign out" className="hidden w-full cursor-pointer px-5 py-2 text-left text-xs text-slate-300 underline md:block lg:text-sm">
                <FontAwesomeIcon icon={faRightFromBracket} className="mr-2 lg:hidden" />
                <span className="lg:inline">Sign out</span>
            </button>
            {error && <p role="alert" className="hidden px-5 text-xs text-red-300 lg:block">{error}</p>}
            <nav className="flex h-full items-center justify-around text-xs md:h-auto md:flex-col md:items-stretch md:justify-start md:gap-2 md:px-3 md:py-2 lg:text-sm">
                <Link
                    to="/admin/products"
                    title="Products"
                    className={`flex h-full flex-1 flex-col items-center justify-center gap-1 text-slate-400 md:h-auto md:flex-none md:flex-row md:justify-center md:gap-3 md:rounded-lg md:px-3 md:py-3 lg:justify-start ${isActive('/admin/products') ? 'text-white md:bg-[#181818]' : 'hover:text-white md:hover:bg-[#181818]'}`}
                >
                    <FontAwesomeIcon icon={faBox} className="size-5" />
                    <span className="md:hidden lg:inline">Products</span>
                </Link>
                <Link
                    to="/admin/orders"
                    title="Orders"
                    className={`flex h-full flex-1 flex-col items-center justify-center gap-1 text-slate-400 md:h-auto md:flex-none md:flex-row md:justify-center md:gap-3 md:rounded-lg md:px-3 md:py-3 lg:justify-start ${isActive('/admin/orders') ? 'text-white md:bg-[#181818]' : 'hover:text-white md:hover:bg-[#181818]'}`}
                >
                    <FontAwesomeIcon icon={faCube} className="size-5" />
                    <span className="md:hidden lg:inline">Orders</span>
                </Link>
                <hr className="hidden w-full border-slate-800 md:block" />
                <Link
                    to="/"
                    title="View Store"
                    className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-slate-400 md:h-auto md:flex-none md:flex-row md:justify-center md:gap-3 md:rounded-lg md:px-3 md:py-3 lg:justify-start hover:text-white md:hover:bg-[#181818]"
                >
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="size-5" />
                    <span className="md:hidden lg:inline">View Store</span>
                </Link>
                <button
                    type="button"
                    onClick={onSignOut}
                    title="Sign out"
                    className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-slate-400 md:hidden"
                >
                    <FontAwesomeIcon icon={faRightFromBracket} className="size-5" />
                    <span>Sign out</span>
                </button>
            </nav>
        </aside>
    )
}
