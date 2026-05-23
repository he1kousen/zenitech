import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase, getImageUrl } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import {
  formatRupiah,
  formatDate,
  shortOrderId,
  getStatusMeta,
} from '../lib/orders'

function CheckIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="32" fill="#e6f4ea" />
      <path
        d="M20 33l8 8 16-18"
        stroke="#1e7e34"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StatusBadge({ status }) {
  const meta = getStatusMeta(status)
  return (
    <span
      className="text-caption-strong"
      style={{
        background: meta.bg,
        color: meta.fg,
        padding: '4px 12px',
        borderRadius: 9999,
        display: 'inline-block',
      }}
    >
      {meta.label}
    </span>
  )
}

function OrderItemRow({ item }) {
  const product = item.products
  const variant = item.product_variants
  const image =
    product?.product_images?.find((img) => img.is_primary)?.url ||
    product?.product_images?.[0]?.url ||
    null
  const variantLabel = [variant?.storage, variant?.color].filter(Boolean).join(' · ')

  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 0',
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 8,
          background: '#fafafc',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
        }}
      >
        {image ? (
          <img
            src={getImageUrl(image, 'thumb')}
            alt={product?.name}
            loading="lazy"
            style={{ width: '85%', height: '85%', objectFit: 'contain' }}
          />
        ) : (
          <span className="text-caption text-ink-muted-48">N/A</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-body-strong text-ink">{product?.name}</p>
        {variantLabel && (
          <p className="text-caption text-ink-muted-48" style={{ marginTop: 2 }}>
            {variantLabel}
          </p>
        )}
        <p className="text-caption text-ink-muted-48" style={{ marginTop: 2 }}>
          Qty: {item.quantity}
        </p>
      </div>
      <span className="text-body-strong text-ink" style={{ flexShrink: 0 }}>
        {formatRupiah(Number(item.price_snapshot) * item.quantity)}
      </span>
    </li>
  )
}

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!orderId) {
      navigate('/orders', { replace: true })
      return
    }
    if (!user) return

    let cancelled = false

    const fetchOrder = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: orderError } = await supabase
          .from('orders')
          .select(
            `
            id,
            status,
            total_amount,
            shipping_address,
            created_at,
            order_items (
              id,
              quantity,
              price_snapshot,
              products ( id, name, slug, product_images ( url, is_primary ) ),
              product_variants ( id, storage, color )
            )
          `
          )
          .eq('id', orderId)
          .eq('user_id', user.id)
          .single()

        if (orderError) throw orderError
        if (!cancelled) setOrder(data)
      } catch (err) {
        console.error('[OrderSuccess] fetch error:', err)
        if (!cancelled) {
          setError(
            err?.message ||
              'Pesanan tidak ditemukan atau kamu tidak punya akses.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOrder()
    return () => {
      cancelled = true
    }
  }, [orderId, user, navigate])

  if (loading) {
    return (
      <main
        className="bg-canvas-parchment"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <p className="text-body-base text-ink-muted-48">Memuat detail pesanan…</p>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main
        className="bg-canvas-parchment"
        style={{ minHeight: '100vh', padding: '64px 20px' }}
      >
        <div
          style={{
            maxWidth: 600,
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 17,
          }}
        >
          <h1 className="text-display-md text-ink">Pesanan tidak ditemukan</h1>
          <p className="text-body-base text-ink-muted-48">
            {error || 'Order ID tidak valid.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/orders" className="btn-primary active-scale">
              Lihat Pesanan Saya
            </Link>
            <Link to="/products" className="btn-secondary-pill active-scale">
              Lanjut Belanja
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const addr = order.shipping_address || {}
  const items = order.order_items || []

  return (
    <main className="bg-canvas-parchment" style={{ minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: '64px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
        }}
      >
        {/* HERO — checkmark + headline */}
        <motion.section
          initial={prefersReducedMotion ? false : "hidden"}
          animate={prefersReducedMotion ? false : "visible"}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } },
            hidden: {}
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 17,
            textAlign: 'center',
          }}
        >
          <motion.div variants={{ hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1, transition: { type: "spring", bounce: 0.5 } } }}>
            <CheckIcon />
          </motion.div>
          <motion.h1 
            className="text-display-md text-ink"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            Pembayaran Berhasil!
          </motion.h1>
          <motion.p 
            className="text-body-base text-ink-muted-48"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            Terima kasih telah berbelanja di Zenitech
          </motion.p>
        </motion.section>

        {/* CARD — detail order */}
        <motion.section
          className="bg-canvas"
          initial={prefersReducedMotion ? false : "hidden"}
          animate={prefersReducedMotion ? false : "visible"}
          variants={{
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
            hidden: {}
          }}
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: 18,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 17,
          }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <p className="text-caption text-ink-muted-48">Nomor Pesanan</p>
              <p className="text-body-strong text-ink">
                {shortOrderId(order.id)}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
            style={{
              borderTop: '1px solid #e0e0e0',
              paddingTop: 12,
            }}
          >
            <p className="text-caption text-ink-muted-48" style={{ marginBottom: 4 }}>
              Tanggal
            </p>
            <p className="text-body-base text-ink">
              {formatDate(order.created_at)}
            </p>
          </motion.div>

          {/* List item */}
          <motion.div 
            variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
            style={{ borderTop: '1px solid #e0e0e0', paddingTop: 8 }}
          >
            <p
              className="text-caption-strong text-ink"
              style={{ marginBottom: 4 }}
            >
              Produk
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
              }}
            >
              {items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </ul>
          </motion.div>

          {/* Total */}
          <motion.div
            variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
            style={{
              borderTop: '1px solid #e0e0e0',
              paddingTop: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span className="text-body-strong text-ink">Total Pembayaran</span>
            <span
              className="text-body-strong text-ink"
              style={{ fontSize: 21 }}
            >
              {formatRupiah(order.total_amount)}
            </span>
          </motion.div>

          {/* Alamat pengiriman */}
          <motion.div
            variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
            style={{
              borderTop: '1px solid #e0e0e0',
              paddingTop: 12,
            }}
          >
            <p
              className="text-caption-strong text-ink"
              style={{ marginBottom: 6 }}
            >
              Alamat Pengiriman
            </p>
            <p className="text-body-base text-ink">{addr.recipient}</p>
            <p className="text-caption text-ink-muted-80" style={{ marginTop: 2 }}>
              {addr.phone}
            </p>
            <p className="text-body-base text-ink-muted-80" style={{ marginTop: 6 }}>
              {addr.address}
            </p>
            <p className="text-body-base text-ink-muted-80" style={{ marginTop: 2 }}>
              {[addr.city, addr.postal_code, addr.province]
                .filter(Boolean)
                .join(', ')}
            </p>
            {addr.shipping_method && (
              <p className="text-caption text-ink-muted-48" style={{ marginTop: 8 }}>
                Pengiriman: {addr.shipping_method.label} (
                {addr.shipping_method.courier}) — estimasi{' '}
                {addr.shipping_method.eta}
              </p>
            )}
          </motion.div>
        </motion.section>

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/orders" className="btn-primary active-scale">
            Lihat Pesanan Saya
          </Link>
          <Link to="/products" className="btn-secondary-pill active-scale">
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </main>
  )
}
