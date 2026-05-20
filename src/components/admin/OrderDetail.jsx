import { useEffect, useState } from 'react'
import { supabase, getImageUrl } from '../../lib/supabase'
import {
  formatRupiah,
  formatDate,
  shortOrderId,
  getStatusMeta,
} from '../../lib/orders'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu Pembayaran' },
  { value: 'paid', label: 'Dibayar / Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

const STATUS_ORDER = ['pending', 'paid', 'shipped', 'delivered']

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e0e0e0',
  borderRadius: 8,
  fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif',
  fontSize: 14,
  letterSpacing: '-0.224px',
  background: '#ffffff',
  color: '#1d1d1f',
  outline: 'none',
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

function SectionCard({ title, children }) {
  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: 18,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <h3 className="text-body-strong text-ink" style={{ margin: 0 }}>
        {title}
      </h3>
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
      <span className="text-caption text-ink-muted-80">{label}</span>
      <span
        className="text-caption-strong text-ink"
        style={{ textAlign: 'right' }}
      >
        {value}
      </span>
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
  const variantLabel = [variant?.storage, variant?.color]
    .filter(Boolean)
    .join(' · ')

  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '10px 0',
        borderTop: '1px solid #f0f0f0',
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
          <span className="text-fine-print text-ink-muted-48">N/A</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="text-caption-strong text-ink" style={{ margin: 0 }}>
          {product?.name}
        </p>
        {variantLabel && (
          <p
            className="text-fine-print text-ink-muted-48"
            style={{ margin: '2px 0 0' }}
          >
            {variantLabel}
          </p>
        )}
        <p
          className="text-fine-print text-ink-muted-48"
          style={{ margin: '2px 0 0' }}
        >
          Qty: {item.quantity} · {formatRupiah(Number(item.price_snapshot))}/item
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

export default function OrderDetail({ open, orderId, onClose, onUpdated }) {
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [shipping, setShipping] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [newStatus, setNewStatus] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [courier, setCourier] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !orderId) return

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
              user_id,
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
            .single(),
          supabase
            .from('payments')
            .select('id, status, paid_at, midtrans_order_id, created_at')
            .eq('order_id', orderId)
            .maybeSingle(),
          supabase
            .from('shipping')
            .select('id, courier, tracking_number, status, shipped_at')
            .eq('order_id', orderId)
            .maybeSingle(),
        ])

        if (orderRes.error) throw orderRes.error

        if (!cancelled) {
          setOrder(orderRes.data)
          setPayment(paymentRes.data || null)
          setShipping(shippingRes.data || null)
          setNewStatus(orderRes.data.status)
          setTrackingNumber(shippingRes.data?.tracking_number || '')
          setCourier(
            shippingRes.data?.courier ||
              orderRes.data?.shipping_address?.shipping_method?.courier ||
              ''
          )
        }
      } catch (err) {
        console.error('[Admin OrderDetail] fetch error:', err)
        if (!cancelled) {
          setError(err?.message || 'Gagal memuat detail pesanan.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => {
      cancelled = true
    }
  }, [open, orderId])

  if (!open) return null

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError(null)

    if (newStatus === 'shipped' && !trackingNumber.trim()) {
      setError('Nomor resi wajib diisi untuk status Dikirim.')
      return
    }

    setSubmitting(true)
    try {
      // Update order status
      const { error: orderErr } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      if (orderErr) throw orderErr

      // Sinkronisasi shipping kalau status shipped/delivered
      if (newStatus === 'shipped' || newStatus === 'delivered') {
        const shippingPayload = {
          order_id: orderId,
          courier: courier.trim() || null,
          tracking_number: trackingNumber.trim() || null,
          status: newStatus === 'delivered' ? 'delivered' : 'shipped',
          shipped_at: shipping?.shipped_at || new Date().toISOString(),
        }

        if (shipping?.id) {
          const { error: shipErr } = await supabase
            .from('shipping')
            .update(shippingPayload)
            .eq('id', shipping.id)
          if (shipErr) throw shipErr
        } else {
          const { error: shipErr } = await supabase
            .from('shipping')
            .insert(shippingPayload)
          if (shipErr) throw shipErr
        }
      }

      onUpdated?.()
      onClose?.()
    } catch (err) {
      console.error('[Admin OrderDetail] update error:', err)
      setError(err?.message || 'Gagal update status pesanan.')
    } finally {
      setSubmitting(false)
    }
  }

  const addr = order?.shipping_address || {}
  const items = order?.order_items || []
  const shippingMethod = addr.shipping_method
  const subtotal = items.reduce(
    (sum, it) => sum + Number(it.price_snapshot) * it.quantity,
    0
  )
  const ongkir = shippingMethod ? Number(shippingMethod.cost) : 0

  // Status hanya boleh maju (paid > pending, dst). Cancelled selalu boleh dipilih.
  const currentIdx = STATUS_ORDER.indexOf(order?.status)
  const isOptionDisabled = (value) => {
    if (!order) return false
    if (value === 'cancelled') return false
    const idx = STATUS_ORDER.indexOf(value)
    if (currentIdx < 0) return false
    return idx >= 0 && idx < currentIdx
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 20px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        style={{
          background: '#f5f5f7',
          borderRadius: 18,
          width: '100%',
          maxWidth: 720,
          maxHeight: 'calc(100vh - 80px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: '20px 24px',
            background: '#ffffff',
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div>
            <h2 className="text-display-md text-ink" style={{ margin: 0 }}>
              {order ? `Detail ${shortOrderId(order.id)}` : 'Memuat…'}
            </h2>
            {order && (
              <p
                className="text-caption text-ink-muted-48"
                style={{ margin: '4px 0 0' }}
              >
                {formatDate(order.created_at)}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {order && <StatusBadge status={order.status} />}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="active-scale"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7a7a7a',
                fontSize: 24,
                lineHeight: 1,
                cursor: 'pointer',
                padding: 4,
              }}
            >
              ×
            </button>
          </div>
        </header>

        {/* Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {loading && (
            <p className="text-body-base text-ink-muted-48">
              Memuat detail pesanan…
            </p>
          )}

          {!loading && order && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Produk */}
              <SectionCard title="Produk">
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {items.map((item) => (
                    <OrderItemRow key={item.id} item={item} />
                  ))}
                </ul>

                <div
                  style={{
                    borderTop: '1px solid #e0e0e0',
                    paddingTop: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <InfoRow label="Subtotal" value={formatRupiah(subtotal)} />
                  <InfoRow label="Ongkos kirim" value={formatRupiah(ongkir)} />
                  <InfoRow
                    label="Total"
                    value={formatRupiah(order.total_amount)}
                  />
                </div>
              </SectionCard>

              {/* Pembeli + alamat */}
              <SectionCard title="Pembeli & Alamat">
                <p
                  className="text-caption-strong text-ink"
                  style={{ margin: 0 }}
                >
                  {addr.recipient || '—'}
                </p>
                <p
                  className="text-fine-print text-ink-muted-80"
                  style={{ margin: 0 }}
                >
                  {addr.phone || '—'}
                </p>
                <p
                  className="text-caption text-ink-muted-80"
                  style={{ margin: '6px 0 0' }}
                >
                  {addr.address || '—'}
                </p>
                <p
                  className="text-caption text-ink-muted-80"
                  style={{ margin: 0 }}
                >
                  {[addr.city, addr.postal_code, addr.province]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </SectionCard>

              {/* Pengiriman info */}
              <SectionCard title="Pengiriman">
                {shippingMethod ? (
                  <>
                    <InfoRow
                      label="Metode"
                      value={`${shippingMethod.label} (${shippingMethod.courier})`}
                    />
                    <InfoRow
                      label="Estimasi"
                      value={shippingMethod.eta || '—'}
                    />
                  </>
                ) : (
                  <p className="text-caption text-ink-muted-48">
                    Belum ada metode pengiriman dipilih.
                  </p>
                )}
                {shipping?.tracking_number && (
                  <InfoRow
                    label="Resi tersimpan"
                    value={`${shipping.courier || '—'} · ${shipping.tracking_number}`}
                  />
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
                  <p className="text-caption text-ink-muted-48">
                    Belum ada data pembayaran.
                  </p>
                )}
              </SectionCard>

              {/* Update Status */}
              <form onSubmit={handleUpdate}>
                <SectionCard title="Update Status Pesanan">
                  <div>
                    <label
                      className="text-caption-strong text-ink"
                      style={{ display: 'block', marginBottom: 6 }}
                    >
                      Status baru
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      style={inputStyle}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          disabled={isOptionDisabled(opt.value)}
                        >
                          {opt.label}
                          {isOptionDisabled(opt.value) ? ' (sudah dilewati)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {newStatus === 'shipped' && (
                    <>
                      <div>
                        <label
                          className="text-caption-strong text-ink"
                          style={{ display: 'block', marginBottom: 6 }}
                        >
                          Kurir
                        </label>
                        <input
                          type="text"
                          value={courier}
                          onChange={(e) => setCourier(e.target.value)}
                          style={inputStyle}
                          placeholder="JNE / SiCepat / J&T"
                        />
                      </div>
                      <div>
                        <label
                          className="text-caption-strong text-ink"
                          style={{ display: 'block', marginBottom: 6 }}
                        >
                          Nomor Resi <span style={{ color: '#b3261e' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          style={inputStyle}
                          placeholder="Masukkan nomor resi"
                          required
                        />
                      </div>
                    </>
                  )}

                  {error && (
                    <div
                      role="alert"
                      className="text-caption"
                      style={{
                        color: '#b3261e',
                        background: '#fde7e9',
                        border: '1px solid #b3261e',
                        borderRadius: 8,
                        padding: 12,
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary active-scale"
                    style={{
                      width: '100%',
                      padding: '12px 22px',
                      opacity: submitting ? 0.6 : 1,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {submitting ? 'Menyimpan…' : 'Update Status'}
                  </button>
                </SectionCard>
              </form>
            </div>
          )}

          {!loading && !order && (
            <p
              role="alert"
              className="text-caption"
              style={{ color: '#b3261e' }}
            >
              {error || 'Pesanan tidak ditemukan.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
