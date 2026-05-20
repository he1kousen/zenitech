import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import { getImageUrl } from '../lib/supabase'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  formatRupiah,
  formatDateShort,
  shortOrderId,
  getStatusMeta,
} from '../lib/orders'

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
        whiteSpace: 'nowrap',
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
        alignItems: 'center',
        gap: 12,
        padding: '8px 0',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
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
        <p
          className="text-body-strong text-ink"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product?.name}
        </p>
        <p className="text-caption text-ink-muted-48" style={{ marginTop: 2 }}>
          {variantLabel ? `${variantLabel} · ` : ''}Qty: {item.quantity}
        </p>
      </div>
      <span
        className="text-caption-strong text-ink"
        style={{ flexShrink: 0 }}
      >
        {formatRupiah(Number(item.price_snapshot) * item.quantity)}
      </span>
    </li>
  )
}

function OrderCard({ order }) {
  const items = order.order_items || []
  const visibleItems = items.slice(0, 3)
  const hiddenCount = items.length - visibleItems.length

  return (
    <article
      className="bg-canvas"
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: 18,
        padding: 24,
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <p className="text-body-strong text-ink">{shortOrderId(order.id)}</p>
          <p className="text-caption text-ink-muted-48" style={{ marginTop: 2 }}>
            {formatDateShort(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </header>

      {/* Items */}
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          borderTop: '1px solid #e0e0e0',
          paddingTop: 8,
        }}
      >
        {visibleItems.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
        {hiddenCount > 0 && (
          <li
            className="text-caption text-ink-muted-48"
            style={{ paddingTop: 8 }}
          >
            +{hiddenCount} produk lainnya
          </li>
        )}
      </ul>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #e0e0e0',
          paddingTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <p className="text-caption text-ink-muted-48">Total Pesanan</p>
          <p className="text-body-strong text-ink">
            {formatRupiah(order.total_amount)}
          </p>
        </div>
        <Link
          to={`/orders/${order.id}`}
          className="text-link text-body-base"
          style={{ textDecoration: 'none' }}
        >
          Lihat Detail →
        </Link>
      </footer>
    </article>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '64px 24px',
        gap: 17,
      }}
    >
      <BagIcon />
      <h2 className="text-tagline text-ink">Belum ada pesanan</h2>
      <p className="text-body-base text-ink-muted-48">
        Yuk mulai belanja produk Apple favorit kamu.
      </p>
      <Link to="/products" className="btn-primary active-scale">
        Mulai Belanja
      </Link>
    </div>
  )
}

export default function Orders() {
  usePageMeta({
    title: 'Pesanan Saya — Zenitech',
    description: 'Riwayat pesanan dan tracking status pengiriman.',
  })

  const { user } = useAuthContext()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    const fetchOrders = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(
            `
            id,
            status,
            total_amount,
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        if (!cancelled) setOrders(data || [])
      } catch (err) {
        console.error('[Orders] fetch error:', err)
        if (!cancelled) {
          setError(err?.message || 'Gagal memuat pesanan.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOrders()
    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <main className="bg-canvas-parchment" style={{ minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '48px 20px 80px',
        }}
      >
        <h1
          className="text-display-md text-ink"
          style={{ marginBottom: 32 }}
        >
          Pesanan Saya
        </h1>

        {loading && (
          <p className="text-body-base text-ink-muted-48">Memuat pesanan…</p>
        )}

        {!loading && error && (
          <p
            className="text-caption"
            style={{
              color: '#b3261e',
              padding: 17,
              background: '#ffffff',
              border: '1px solid #b3261e',
              borderRadius: 8,
            }}
            role="alert"
          >
            {error}
          </p>
        )}

        {!loading && !error && orders.length === 0 && <EmptyState />}

        {!loading && !error && orders.length > 0 && (
          <div>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
