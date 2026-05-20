import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase, getImageUrl } from '../lib/supabase'
import { useAuthContext } from '../contexts/AuthContext'
import {
  formatRupiah,
  formatDate,
  shortOrderId,
  getStatusMeta,
  STEPS,
  stepIndexFromStatus,
} from '../lib/orders'

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

function StepTracker({ status }) {
  const activeIndex = stepIndexFromStatus(status)
  const isCancelled = status === 'cancelled'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 8,
      }}
      role="list"
      aria-label="Status pesanan"
    >
      {STEPS.map((label, idx) => {
        const reached = !isCancelled && idx <= activeIndex
        const isLast = idx === STEPS.length - 1

        return (
          <div
            key={label}
            role="listitem"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              minWidth: 0,
            }}
          >
            {/* Connector ke step berikutnya */}
            {!isLast && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 14,
                  left: '50%',
                  width: '100%',
                  height: 2,
                  background: idx < activeIndex && !isCancelled ? '#0066cc' : '#e0e0e0',
                  zIndex: 0,
                }}
              />
            )}
            {/* Bullet */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 9999,
                background: reached ? '#0066cc' : '#ffffff',
                border: `2px solid ${reached ? '#0066cc' : '#e0e0e0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                zIndex: 1,
                flexShrink: 0,
              }}
            >
              {reached && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M5 12l5 5L20 7"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <p
              className="text-caption"
              style={{
                marginTop: 8,
                textAlign: 'center',
                color: reached ? '#0066cc' : '#7a7a7a',
                fontWeight: reached ? 600 : 400,
              }}
            >
              {label}
            </p>
          </div>
        )
      })}
    </div>
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
          Qty: {item.quantity} ·{' '}
          {formatRupiah(Number(item.price_snapshot))}/item
        </p>
      </div>
      <span className="text-body-strong text-ink" style={{ flexShrink: 0 }}>
        {formatRupiah(Number(item.price_snapshot) * item.quantity)}
      </span>
    </li>
  )
}

function SectionCard({ title, children }) {
  return (
    <section
      className="bg-canvas"
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: 18,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h2 className="text-tagline text-ink">{title}</h2>
      {children}
    </section>
  )
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 12,
      }}
    >
      <span className="text-body-base text-ink-muted-80">{label}</span>
      <span className="text-body-base text-ink" style={{ textAlign: 'right' }}>
        {value}
      </span>
    </div>
  )
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthContext()

  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [shipping, setShipping] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      navigate('/orders', { replace: true })
      return
    }
    if (!user) return

    let cancelled = false

    const fetchAll = async () => {
      setLoading(true)
      setError(null)
      try {
        const [orderRes, paymentRes, shippingRes] = await Promise.all([
          supabase
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
            .eq('id', id)
            .eq('user_id', user.id)
            .single(),
          supabase
            .from('payments')
            .select('id, status, paid_at, midtrans_order_id, created_at')
            .eq('order_id', id)
            .maybeSingle(),
          supabase
            .from('shipping')
            .select('courier, tracking_number, status, shipped_at')
            .eq('order_id', id)
            .maybeSingle(),
        ])

        if (orderRes.error) throw orderRes.error

        if (!cancelled) {
          setOrder(orderRes.data)
          setPayment(paymentRes.data || null)
          setShipping(shippingRes.data || null)
        }
      } catch (err) {
        console.error('[OrderDetail] fetch error:', err)
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

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [id, user, navigate])

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
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 17 }}>
          <h1 className="text-display-md text-ink">Pesanan tidak ditemukan</h1>
          <p className="text-body-base text-ink-muted-48">
            {error || 'Order ID tidak valid.'}
          </p>
          <div>
            <Link to="/orders" className="btn-primary active-scale">
              Kembali ke Pesanan Saya
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const addr = order.shipping_address || {}
  const items = order.order_items || []
  const shippingMethod = addr.shipping_method
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price_snapshot) * it.quantity,
    0
  )
  const ongkir = shippingMethod ? Number(shippingMethod.cost) : 0

  return (
    <main className="bg-canvas-parchment" style={{ minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '48px 20px 80px',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {/* Breadcrumb */}
        <Link
          to="/orders"
          className="text-link text-caption"
          style={{ textDecoration: 'none' }}
        >
          ← Kembali ke Pesanan Saya
        </Link>

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
            <h1 className="text-display-md text-ink">
              Detail Pesanan {shortOrderId(order.id)}
            </h1>
            <p className="text-caption text-ink-muted-48" style={{ marginTop: 6 }}>
              Dipesan {formatDate(order.created_at)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </header>

        {/* Step tracker */}
        <SectionCard title="Status Pesanan">
          <StepTracker status={order.status} />
          {order.status === 'cancelled' && (
            <p
              className="text-caption"
              style={{
                color: '#b3261e',
                marginTop: 8,
                textAlign: 'center',
              }}
            >
              Pesanan ini dibatalkan.
            </p>
          )}
        </SectionCard>

        {/* Produk */}
        <SectionCard title="Produk">
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

          <div
            style={{
              borderTop: '1px solid #e0e0e0',
              paddingTop: 12,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <InfoRow label="Subtotal" value={formatRupiah(subtotal)} />
            <InfoRow label="Ongkos kirim" value={formatRupiah(ongkir)} />
            <div
              style={{
                borderTop: '1px solid #e0e0e0',
                paddingTop: 12,
                marginTop: 6,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span className="text-body-strong text-ink">Total</span>
              <span className="text-body-strong text-ink" style={{ fontSize: 21 }}>
                {formatRupiah(order.total_amount)}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* Alamat */}
        <SectionCard title="Alamat Pengiriman">
          <div>
            <p className="text-body-strong text-ink">{addr.recipient}</p>
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
          </div>
        </SectionCard>

        {/* Pengiriman */}
        <SectionCard title="Pengiriman">
          {shippingMethod ? (
            <>
              <InfoRow
                label="Kurir"
                value={`${shippingMethod.label} (${shippingMethod.courier})`}
              />
              <InfoRow
                label="Estimasi"
                value={shippingMethod.eta || '—'}
              />
              <InfoRow
                label="Ongkos kirim"
                value={formatRupiah(shippingMethod.cost)}
              />
            </>
          ) : (
            <p className="text-body-base text-ink-muted-48">
              Belum ada metode pengiriman dipilih.
            </p>
          )}

          {shipping?.tracking_number ? (
            <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 12 }}>
              <InfoRow
                label="Nomor Resi"
                value={shipping.tracking_number}
              />
              {shipping.shipped_at && (
                <InfoRow
                  label="Dikirim pada"
                  value={formatDate(shipping.shipped_at)}
                />
              )}
            </div>
          ) : (
            <p
              className="text-caption text-ink-muted-48"
              style={{ borderTop: '1px solid #e0e0e0', paddingTop: 12 }}
            >
              Nomor resi akan tersedia saat pesanan dikirim.
            </p>
          )}
        </SectionCard>

        {/* Pembayaran */}
        <SectionCard title="Pembayaran">
          {payment ? (
            <>
              <InfoRow
                label="Status"
                value={getStatusMeta(payment.status).label}
              />
              {payment.paid_at && (
                <InfoRow
                  label="Dibayar pada"
                  value={formatDate(payment.paid_at)}
                />
              )}
              {payment.midtrans_order_id && (
                <InfoRow
                  label="ID Transaksi"
                  value={payment.midtrans_order_id}
                />
              )}
            </>
          ) : (
            <p className="text-body-base text-ink-muted-48">
              Belum ada data pembayaran.
            </p>
          )}
        </SectionCard>
      </div>
    </main>
  )
}
