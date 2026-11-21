
import { Routes, Route } from 'react-router'
import './App.css'
import Homepage from './components/Homepage'
import Backroom from './components/Backroom'
import Cart from './components/Cart'
import Header from './components/Header'
import { useEffect, useRef, useState } from 'react'
import Checkout from './components/Checkout'
import Product from './components/Product'
import { getProducts } from '../data'

function animateProductToCart(sourceImage, cartButton, addButton) {
  if (!cartButton?.isConnected) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const imageSource = sourceImage instanceof HTMLImageElement
    && (!sourceImage.complete || sourceImage.naturalWidth > 0)
    ? sourceImage.currentSrc || sourceImage.src
    : ''
  const imageRect = sourceImage instanceof HTMLImageElement
    ? sourceImage.getBoundingClientRect()
    : null
  const sourceRect = imageRect?.width && imageRect.height
    ? imageRect
    : addButton?.getBoundingClientRect()
  if (!sourceRect?.width || !sourceRect.height) return

  const cartRect = cartButton.getBoundingClientRect()

  const flyerWidth = 56
  const flyerHeight = 72
  const startLeft = sourceRect.left + (sourceRect.width - flyerWidth) / 2
  const startTop = sourceRect.top + (sourceRect.height - flyerHeight) / 2
  const startCenterX = startLeft + flyerWidth / 2
  const startCenterY = startTop + flyerHeight / 2
  const deltaX = cartRect.left + cartRect.width / 2 - startCenterX
  const deltaY = cartRect.top + cartRect.height / 2 - startCenterY
  const flyer = document.createElement(imageSource ? 'img' : 'div')

  if (imageSource) {
    flyer.src = imageSource
    flyer.alt = ''
  } else {
    flyer.textContent = '+1'
  }
  flyer.setAttribute('aria-hidden', 'true')
  Object.assign(flyer.style, {
    position: 'fixed',
    left: `${startLeft}px`,
    top: `${startTop}px`,
    width: `${flyerWidth}px`,
    height: `${flyerHeight}px`,
    objectFit: 'contain',
    pointerEvents: 'none',
    zIndex: '9999',
    borderRadius: '6px',
    backgroundColor: imageSource ? '#fff' : '#111',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    display: imageSource ? 'block' : 'grid',
    placeItems: 'center',
    boxShadow: '0 4px 16px rgb(0 0 0 / 20%)',
  })
  document.body.appendChild(flyer)

  const animation = flyer.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      {
        transform: `translate(${deltaX * 0.55}px, ${deltaY * 0.55 - 24}px) scale(0.72) rotate(-8deg)`,
        opacity: 1,
        offset: 0.58,
      },
      { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.15) rotate(12deg)`, opacity: 0.15 },
    ],
    { duration: 620, easing: 'cubic-bezier(0.22, 0.8, 0.24, 1)' },
  )

  animation.onfinish = () => flyer.remove()
  cartButton.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.12)', offset: 0.55 },
      { transform: 'scale(1)' },
    ],
    { duration: 360, easing: 'ease-out' },
  )
}

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [cartid, setcartid] = useState([])
  const [cartAnnouncement, setCartAnnouncement] = useState('')
  const cartButtonRef = useRef(null)
  const [searchterm, setsearchterm] = useState('')

  function addcart(id, sourceImage, productName, addButton) {
    setcartid(ids => [...ids, id])
    const itemCount = cartid.length + 1
    setCartAnnouncement(
      `${productName || 'Item'} added to cart. ${itemCount} ${itemCount === 1 ? 'item' : 'items'} in cart.`,
    )
    animateProductToCart(sourceImage, cartButtonRef.current, addButton)
  }

  function updateCartQuantity(id, amount) {
    setcartid(ids => {
      if (amount > 0) {
        return [...ids, id]
      }

      const indexToRemove = ids.indexOf(id)
      if (indexToRemove === -1) {
        return ids
      }

      return ids.filter((cartId, index) => index !== indexToRemove)
    })
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const productData = await getProducts()
        setProducts(productData)
      } catch (error) {
        console.error('Failed to load products:', error)
        setLoadError('Could not load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])



  function searchProducts(term) {
    const query = term.trim().toLowerCase()
    if (!query) return products

    return products.filter((item) =>
      item.name?.toLowerCase().includes(query)
    )
  }

  return (
    <>
      <Header
        cartButtonRef={cartButtonRef}
        cartItemCount={cartid.length}
        cartAnnouncement={cartAnnouncement}
        setsearchterm={setsearchterm}
        searchterm={searchterm}
      />
      <Routes>
        <Route
          path="/"
          element={(
            <Homepage
              addcart={addcart}
              products={products}
              searchterm={searchterm}
              searchProducts={searchProducts}
              loading={loading}
              loadError={loadError}
            />
          )}
        />
        <Route
          path='/cart'
          element={<Cart cartid={cartid} updateCartQuantity={updateCartQuantity} />}
        />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/product' element={<Product addcart={addcart} />} />
        <Route path='/admin' element={<Backroom></Backroom>}></Route>
      </Routes></>
  )
}

export default App
