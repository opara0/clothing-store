import { useLocation } from "react-router"
import { getProductImageUrl } from "./Homepage"

export default function Product({ addcart }) {
    const { state } = useLocation()
    const { product } = state ?? {}

    if (!product) return <p>Product not found.</p>
    const imageurl = getProductImageUrl(product.image_url)
    return (
        <>
            <section className="grid max-h-screen gap-10  place-items-center p-10">


                <div className="flex gap-10">
                    <img
                        src={imageurl}
                        alt="Product"
                        className="w-8/15 h-84 rounded"
                    />


                    <div className="flex flex-col justify-between p-4 w-4/4 border ">
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