import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'


export function getProductImageUrl(value) {
    if (Array.isArray(value)) {
        return value[0] || ''
    }

    if (typeof value !== 'string') {
        return ''
    }

    if (value.startsWith('[')) {
        try {
            const imageUrls = JSON.parse(value)
            return Array.isArray(imageUrls) ? imageUrls[0] || '' : value
        } catch {
            return value
        }
    }

    return value
}

function getBackgroundColor(data, width, height) {
    const sampleSize = Math.min(12, Math.floor(Math.min(width, height) / 2))
    const samples = []

    for (const [left, top] of [
        [0, 0],
        [width - sampleSize, 0],
        [0, height - sampleSize],
        [width - sampleSize, height - sampleSize],
    ]) {
        const total = [0, 0, 0]
        let count = 0

        for (let y = top; y < top + sampleSize; y += 1) {
            for (let x = left; x < left + sampleSize; x += 1) {
                const index = (y * width + x) * 4
                if (data[index + 3] < 250) continue

                total[0] += data[index]
                total[1] += data[index + 1]
                total[2] += data[index + 2]
                count += 1
            }
        }

        if (count > 0) {
            samples.push(total.map((channel) => channel / count))
        }
    }

    if (samples.length !== 4) return null

    const background = [0, 1, 2].map((channel) => {
        const values = samples.map((sample) => sample[channel]).sort((a, b) => a - b)
        return values[Math.floor(values.length / 2)]
    })

    const toleranceSquared = 36 * 36
    const hasConsistentBackground = samples.every((sample) => {
        const red = sample[0] - background[0]
        const green = sample[1] - background[1]
        const blue = sample[2] - background[2]
        return red * red + green * green + blue * blue <= toleranceSquared
    })

    return hasConsistentBackground ? background : null
}

function removeUniformBackground(image) {
    const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas is not available for product image processing.')

    context.drawImage(image, 0, 0, width, height)
    const imageData = context.getImageData(0, 0, width, height)
    const { data } = imageData

    for (let index = 3; index < data.length; index += 4) {
        if (data[index] < 250) return null
    }

    const background = getBackgroundColor(data, width, height)
    if (!background) return null

    const toleranceSquared = 38 * 38
    const totalPixels = width * height
    const visited = new Uint8Array(totalPixels)
    const queue = new Int32Array(totalPixels)
    let queueEnd = 0
    let queueStart = 0

    function enqueueIfBackground(pixel) {
        if (pixel < 0 || pixel >= totalPixels || visited[pixel]) return

        const index = pixel * 4
        const red = data[index] - background[0]
        const green = data[index + 1] - background[1]
        const blue = data[index + 2] - background[2]
        if (red * red + green * green + blue * blue > toleranceSquared) return

        visited[pixel] = 1
        queue[queueEnd] = pixel
        queueEnd += 1
    }

    for (let x = 0; x < width; x += 1) {
        enqueueIfBackground(x)
        enqueueIfBackground((height - 1) * width + x)
    }
    for (let y = 1; y < height - 1; y += 1) {
        enqueueIfBackground(y * width)
        enqueueIfBackground(y * width + width - 1)
    }

    while (queueStart < queueEnd) {
        const pixel = queue[queueStart]
        queueStart += 1
        data[pixel * 4 + 3] = 0

        const x = pixel % width
        if (x > 0) enqueueIfBackground(pixel - 1)
        if (x < width - 1) enqueueIfBackground(pixel + 1)
        if (pixel >= width) enqueueIfBackground(pixel - width)
        if (pixel < totalPixels - width) enqueueIfBackground(pixel + width)
    }

    if (queueEnd === 0) return null

    context.putImageData(imageData, 0, 0)
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Could not export the processed product image.'))
                return
            }
            resolve(URL.createObjectURL(blob))
        }, 'image/png')
    })
}

function ProductImage({ src, alt }) {
    const [imageSrc, setImageSrc] = useState(src)

    useEffect(() => {
        let active = true
        let processedUrl = ''

        const image = new Image()
        try {
            if (new URL(src, window.location.href).origin !== window.location.origin) {
                image.crossOrigin = 'anonymous'
            }
        } catch (error) {
            console.error('Could not prepare product image for background removal:', error)
            return undefined
        }

        image.onload = async () => {
            try {
                const result = await removeUniformBackground(image)
                if (!active) {
                    if (result) URL.revokeObjectURL(result)
                    return
                }
                if (result) {
                    processedUrl = result
                    setImageSrc(result)
                }
            } catch (error) {
                console.error('Could not remove the product image background:', error)
            }
        }
        image.onerror = () => {
            console.error('Could not load product image for background removal:', src)
        }
        image.src = src

        return () => {
            active = false
            if (processedUrl) URL.revokeObjectURL(processedUrl)
        }
    }, [src])

    return <img src={imageSrc} alt={alt} className="block h-auto w-full object-contain" />
}

export default function Homepage({
    addcart,
    products,
    searchterm,
    searchProducts,
    loading,
    loadError,
}) {
    const navigate = useNavigate()
    const [selectedCategory, setSelectedCategory] = useState('')
    const isSearching = searchterm.trim().length > 0
    const searchResults = isSearching
        ? searchProducts(searchterm)
        : products
    const categories = [
        { label: 'ALL ITEMS', value: '', matchValues: [] },
        { label: 'JACKETS', value: 'jacket', matchValues: ['jacket', 'jackets'] },
        { label: 'DRESSES', value: 'dress', matchValues: ['dress', 'dresses'] },
        { label: 'SKIRTS', value: 'skirt', matchValues: ['skirt', 'skirts'] },
        { label: 'SHOES', value: 'shoe', matchValues: ['shoe', 'shoes'] },
    ]
    const activeCategory = categories.find((category) => category.value === selectedCategory)
    const productsToShow = selectedCategory
        ? searchResults.filter((item) =>
            activeCategory.matchValues.includes(String(item.category ?? '').trim().toLowerCase())
        )
        : searchResults
    return (
        <>
            <main className="w-full p-3 sm:p-5">

                <section className="mt-4 flex flex-row items-baseline md:mt-0 md:justify-between">
                    <h1 className="hidden text-5xl md:block">AVANTA FASHION</h1>
                    <div className="flex w-full flex-row gap-2 overflow-x-auto whitespace-nowrap md:w-auto md:gap-3">
                        {categories.map((category) => (
                            <button
                                key={category.label}
                                type="button"
                                onClick={() => setSelectedCategory(category.value)}
                                aria-pressed={selectedCategory === category.value}
                                className={`cursor-pointer text-sm font-normal ${selectedCategory === category.value ? 'underline underline-offset-4' : ''}`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </section>
                <section className="mt-4 md:mt-8">
                    {loading && <p>Loading products...</p>}
                    {loadError && <p role="alert">{loadError}</p>}
                    {!loading && !loadError && productsToShow.length === 0 && (
                        <p>
                            {isSearching && selectedCategory
                                ? `No ${activeCategory.label.toLowerCase()} match "${searchterm}".`
                                : isSearching
                                ? `No products match "${searchterm}".`
                                : selectedCategory
                                    ? `No ${activeCategory.label.toLowerCase()} are available.`
                                    : 'No products are available yet.'}
                        </p>
                    )}

                    {!loading && !loadError && productsToShow.length > 0 && (
                        <div className="mt-6 columns-2 gap-3 md:columns-4 2xl:columns-5">
                            {productsToShow.map((product) => (
                                <article key={product.id ?? product.name}
                                    onDoubleClick={() => navigate('/product', { state: { product } })}
                                    className="mb-6 break-inside-avoid">
                                    {getProductImageUrl(product.image_url) && (
                                        <div className="bg-neutral-100">
                                            <ProductImage
                                                key={getProductImageUrl(product.image_url)}
                                                src={getProductImageUrl(product.image_url)}
                                                alt={product.name}
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-row justify-between items-center">
                                        <p className="mt-2 text-xs uppercase">{product.name}</p>

                                        <button
                                            type="button"
                                            onDoubleClick={(event) => event.stopPropagation()}
                                            onClick={(event) => addcart(
                                                product.id,
                                                event.currentTarget.closest('article')?.querySelector('img'),
                                                product.name,
                                                event.currentTarget,
                                            )}
                                            className='w-10 cursor-pointer border text-xs font-light text-black'>ADD</button>
                                        <p className='mt-2 text-xs uppercase'>₦{product.price}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    )
}