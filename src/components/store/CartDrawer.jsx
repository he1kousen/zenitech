import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '../../store/cartStore'
import { useAuthContext } from '../../contexts/AuthContext'
import { getImageUrl } from '../../lib/supabase'
import { resolveProductImage, ULTIMATE_FALLBACK } from '../../lib/productImages'
import SafeImage from './SafeImage'

const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6 6 18 18M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" strokeLinecap="round" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path
        d="M14 22h36l-2.8 28a4 4 0 0 1-4 3.6H20.8a4 4 0 0 1-4-3.6L14 22Z"
        stroke="#cccccc"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 22v-4a8 8 0 0 1 16 0v4"
        stroke="#cccccc"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function QuantityControl({ qty, stock, onDec, onInc }) {
  const decDisabled = qty <= 1
  const incDisabled = qty >= stock
  const btn = {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
    background: '#ffffff',
    color: '#1d1d1f',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  return (
    <div className="inline-flex items-center" style={{ gap: 8 }}>
      <button
        type="button"
        onClick={onDec}
        disabled={decDisabled}
        aria-label="Kurangi jumlah"
        className="active-scale"
        style={{ ...btn, opacity: decDisabled ? 0.4 : 1, cursor: decDisabled ? 'not-allowed' : 'pointer' }}
      >
        <MinusIcon />
      </button>
      <span
        className="text-body-strong text-ink"
        aria-live="polite"
        style={{ minWidth: 24, textAlign: 'center' }}
      >
        {qty}
      </span>
      <button
        type="button"
        onClick={onInc}
        disabled={incDisabled}
        aria-label="Tambah jumlah"
        className="active-scale"
        style={{ ...btn, opacity: incDisabled ? 0.4 : 1, cursor: incDisabled ? 'not-allowed' : 'pointer' }}
      >
        <PlusIcon />
      </button>
    </div>
  )
}

function CartItemRow({ item, onUpdateQty, onRemove }) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const variantLabel = [item.storage, item.color].filter(Boolean).join(' · ')
  const resolvedImage = resolveProductImage({
    slug: item.slug,
    image_url: item.image,
    category: item.categorySlug,
  })
  return (
    <motion.li
      layout
      initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
      animate={prefersReducedMotion ? false : { opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? false : { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, borderBottomWidth: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex"
      style={{ gap: 12, padding: '17px 0', borderBottom: '1px solid #f0f0f0', overflow: 'hidden' }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 8,
          backgroundColor: '#fafafc',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <SafeImage
          src={getImageUrl(resolvedImage, 'thumb')}
          fallbacks={[ULTIMATE_FALLBACK]}
          alt={item.name}
          loading="lazy"
          style={{ width: '85%', height: '85%', objectFit: 'contain' }}
        />
      </div>

      <div className="flex flex-col" style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <p
          className="text-body-strong text-ink"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.name}
        </p>
        {variantLabel && (
          <p className="text-caption text-ink-muted-48">{variantLabel}</p>
        )}
        <p className="text-body-strong text-ink" style={{ marginTop: 4 }}>
          {formatRupiah(item.price * item.quantity)}
        </p>

        <div
          className="flex items-center justify-between"
          style={{ marginTop: 8 }}
        >
          <QuantityControl
            qty={item.quantity}
            stock={item.stock || 999}
            onDec={() => onUpdateQty(item.productId, item.variantId, item.quantity - 1)}
            onInc={() => onUpdateQty(item.productId, item.variantId, item.quantity + 1)}
          />
          <button
            type="button"
            onClick={() => onRemove(item.productId, item.variantId)}
            aria-label={`Hapus ${item.name}`}
            className="text-caption text-ink-muted-48 active-scale"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <TrashIcon />
            <span>Hapus</span>
          </button>
        </div>
      </div>
    </motion.li>
  )
}

function EmptyCart({ onGoShop }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ flex: 1, padding: '48px 24px', gap: 17 }}
    >
      <BagIcon />
      <p className="text-display-md text-ink" style={{ fontSize: 21 }}>
        Keranjang kamu kosong
      </p>
      <p className="text-body-base text-ink-muted-48" style={{ marginBottom: 8 }}>
        Yuk pilih produk Apple favorit kamu.
      </p>
      <button
        type="button"
        onClick={onGoShop}
        className="btn-primary active-scale"
      >
        Mulai Belanja
      </button>
    </div>
  )
}

export default function CartDrawer() {
  const navigate = useNavigate()
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const items = useCartStore((s) => s.items)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const subtotal = useCartStore((s) => s.getTotalPrice())

  const { user } = useAuthContext()

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  const handleCheckout = () => {
    closeCart()
    if (!user) {
      navigate('/login?redirect=/checkout')
      return
    }
    navigate('/checkout')
  }

  const handleStartShopping = () => {
    closeCart()
    navigate('/products')
  }

  const isEmpty = items.length === 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#000000',
              zIndex: 80,
            }}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="dialog"
            aria-label="Keranjang belanja"
            aria-modal="true"
            className="cart-drawer-panel bg-canvas flex flex-col"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: 420,
              backgroundColor: '#ffffff',
              zIndex: 90,
              boxShadow: 'rgba(0,0,0,0.08) -2px 0 20px',
            }}
          >
        {/* Header */}
        <header
          className="flex items-center justify-between"
          style={{
            padding: '17px 24px',
            borderBottom: '1px solid #e0e0e0',
            flexShrink: 0,
          }}
        >
          <h2
            className="text-ink"
            style={{
              fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
              fontSize: 21,
              fontWeight: 600,
              lineHeight: 1.19,
              letterSpacing: '0.231px',
              margin: 0,
            }}
          >
            Keranjang Saya
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Tutup keranjang"
            className="active-scale flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              backgroundColor: 'rgba(210, 210, 215, 0.64)',
              color: '#1d1d1f',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <CloseIcon />
          </button>
        </header>

        {/* Body */}
        {isEmpty ? (
          <EmptyCart onGoShop={handleStartShopping} />
        ) : (
          <>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 24px',
              }}
            >
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <CartItemRow
                      key={`${item.productId}-${item.variantId}`}
                      item={item}
                      onUpdateQty={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            {/* Footer */}
            <footer
              style={{
                padding: 24,
                borderTop: '1px solid #e0e0e0',
                flexShrink: 0,
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: 8 }}
              >
                <span className="text-body-strong text-ink">Subtotal</span>
                <span className="text-body-strong text-ink">
                  {formatRupiah(subtotal)}
                </span>
              </div>
              <p
                className="text-caption text-ink-muted-48"
                style={{ marginBottom: 17 }}
              >
                Ongkos kirim dihitung saat checkout
              </p>
              <button
                type="button"
                onClick={handleCheckout}
                className="btn-primary active-scale"
                style={{ width: '100%' }}
              >
                Lanjut ke Checkout
              </button>
            </footer>
          </>
        )}
      </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
