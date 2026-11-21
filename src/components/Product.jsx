import { useLocation } from "react-router"
import { getProductImageUrl } from "./Homepage"

export default function Product({ addcart }) {
    const { state } = useLocation()
    const { product } = state ?? {}

    if (!product) return <p>Product not found.</p>
    const imageurl = getProductImageUrl(product.image_url)
    return (
        <>
            <section className="grid place-items-center gap-6 p-4 sm:gap-10 sm:p-6 md:p-10">


                <div className="flex w-full max-w-6xl flex-col gap-6 md:flex-row md:gap-10">
                    <img
                        src={imageurl}
                        alt="Product"
                        className="h-72 w-full rounded object-contain sm:h-96 md:h-[32rem] md:w-1/2"
                    />


                    <div className="flex w-full min-w-0 flex-col justify-between gap-4 border p-4 md:w-1/2">
                        <h1 className="text-3xl">{product.name}</h1>

                        <p>{product.category}</p>
                        <h1 className="text-3xl">₦{product.price}</h1>
                        <hr className="text-slate-500 mx-auto w-full" />
                        <button
                            type="button"
                            onClick={(event) => addcart(
                                product.id,
                                event.currentTarget.closest('section')?.querySelector('img'),
                                product.name,
                                event.currentTarget,
                            )}
                            className="rounded text-white bg-black w-full text-center my-4 "
                        >
                            Add to Cart
                        </button>
                        <hr className=" text-slate-500 mx-auto w-full mb-5" />
                        <h1 className="font-bold">Description</h1>
                        <p className="font-light text-sm">{product.description}</p>
                    </div>
                </div>
            </section>
        </>
    )
}