import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthContext } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { loadMidtransSnap, openPayment } from '../lib/midtrans'
import { usePageMeta } from '../hooks/usePageMeta'

const formatRupiah = (n) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

const SHIPPING_OPTIONS = [
  {
    id: 'reguler',
    courier: 'JNE REG',
    label: 'Reguler',
    eta: '3–5 hari',
    cost: 25000,
  },
  {
    id: 'express',
    courier: 'JNE YES',
    label: 'Express',
    eta: '1–2 hari',
    cost: 45000,
  },
]

const INITIAL_FORM = {
  recipient: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  province: '',
}

const FIELD_LABELS = {
  recipient: 'Nama penerima',
  phone: 'Nomor telepon',
  address: 'Alamat lengkap',
  city: 'Kota',
  postalCode: 'Kode pos',
  province: 'Provinsi',
}

function validate(form) {
  const errors = {}
  Object.keys(INITIAL_FORM).forEach((key) => {
    if (!form[key] || !form[key].trim()) {
      errors[key] = `${FIELD_LABELS[key]} wajib diisi`
    }
  })

  if (form.phone && !/^(\+62|62|0)[0-9]{8,13}$/.test(form.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Format nomor telepon tidak valid (contoh: 08123456789)'
  }

  if (form.postalCode && !/^[0-9]{5}$/.test(form.postalCode.trim())) {
    errors.postalCode = 'Kode pos harus 5 digit angka'
  }

  return errors
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-caption-strong text-ink"
      style={{ display: 'block', marginBottom: 6 }}
    >
      {children}
    </label>
  )
}

function FieldError({ message }) {
  if (!message) return null
  return (
    <p
      className="text-caption"
      style={{ color: '#d70015', marginTop: 6 }}
      role="alert"
    >
      {message}
    </p>
  )
}

const inputBaseStyle = {
  width: '100%',
  background: '#ffffff',
  borderRadius: 8,
  padding: '12px 16px',
  fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
  fontSize: 17,
  fontWeight: 400,
  lineHeight: 1.47,
  letterSpacing: '-0.374px',
  color: '#1d1d1f',
  outline: 'none',
  transition: 'border-color 120ms ease, box-shadow 120ms ease',
}

function getInputStyle(hasError) {
  return {
    ...inputBaseStyle,
    border: `1px solid ${hasError ? '#d70015' : '#e0e0e0'}`,
  }
}

function ShippingRadioCard({ option, selected, onSelect }) {
  const isSelected = selected === option.id
  return (
    <label
      htmlFor={`ship-${option.id}`}
      className="active-scale"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '17px 20px',
        background: '#ffffff',
        border: `${isSelected ? 2 : 1}px solid ${isSelected ? '#0066cc' : '#e0e0e0'}`,
        borderRadius: 18,
        cursor: 'pointer',
        margin: isSelected ? 0 : 1,
      }}
    >
      <input
        id={`ship-${option.id}`}
        type="radio"
        name="shipping"
        value={option.id}
        checked={isSelected}
        onChange={() => onSelect(option.id)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span className="text-body-strong text-ink">
          {option.label} ({option.courier})
        </span>
        <span className="text-caption text-ink-muted-48">
          Estimasi {option.eta}
        </span>
      </div>
      <span className="text-body-strong text-ink">{formatRupiah(option.cost)}</span>
    </label>
  )
}

function OrderSummaryItem({ item }) {
  const variantLabel = [item.storage, item.color].filter(Boolean).join(' · ')
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
          width: 48,
          height: 48,
          borderRadius: 8,
          background: '#ffffff',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
        }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
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
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.name}
        </p>
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
        {formatRupiah(item.price * item.quantity)}
      </span>
    </li>
  )
}

export default function Checkout() {
  usePageMeta({
    title: 'Checkout — Zenitech',
    description:
      'Selesaikan pembelian produk Apple kamu. Pembayaran aman lewat Midtrans.',
  })

  const navigate = useNavigate()
  const { user } = useAuthContext()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.getTotalPrice())
  const clearCart = useCartStore((s) => s.clearCart)

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [shippingId, setShippingId] = useState(SHIPPING_OPTIONS[0].id)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 834 : false
  )

  // Redirect ke /products kalau cart kosong (skip saat lagi submit/abis sukses)
  useEffect(() => {
    if (!submitting && items.length === 0) {
      navigate('/products', { replace: true })
    }
  }, [items.length, submitting, navigate])

  // Track viewport untuk layout dua-kolom di desktop
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth > 834)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Pre-load Midtrans Snap script biar saat klik "Bayar Sekarang" popup
  // bisa langsung muncul tanpa nunggu network request lagi.
  useEffect(() => {
    loadMidtransSnap().catch((err) => {
      console.warn('[Checkout] Midtrans Snap script gagal di-load:', err.message)
    })
  }, [])

  const selectedShipping = useMemo(
    () => SHIPPING_OPTIONS.find((o) => o.id === shippingId) || SHIPPING_OPTIONS[0],
    [shippingId]
  )
  const total = subtotal + selectedShipping.cost

  const handleChange = (key) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    const validation = validate(form)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }

    if (!user) {
      navigate('/login?redirect=/checkout')
      return
    }

    if (items.length === 0) return

    setSubmitting(true)

    let orderId = null

    try {
      const shippingAddress = {
        recipient: form.recipient.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        postal_code: form.postalCode.trim(),
        province: form.province.trim(),
        shipping_method: {
          id: selectedShipping.id,
          courier: selectedShipping.courier,
          label: selectedShipping.label,
          eta: selectedShipping.eta,
          cost: selectedShipping.cost,
        },
      }

      // 1. Buat order di Supabase (status pending)
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_amount: total,
          shipping_address: shippingAddress,
        })
        .select()
        .single()

      if (orderError) throw orderError
      orderId = order.id

      // 2. Insert order_items
      const orderItems = items.map((it) => ({
        order_id: order.id,
        product_id: it.productId,
        variant_id: it.variantId,
        quantity: it.quantity,
        price_snapshot: it.price,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Pastikan Snap script sudah ke-load
      await loadMidtransSnap()

      // 4. Generate Midtrans token via Edge Function. Kirim juga ongkir
      //    sebagai item sintetik supaya gross_amount = sum(item × qty).
      const itemDetails = items.map((it) => ({
        id: it.variantId || it.productId,
        price: it.price,
        quantity: it.quantity,
        name: [it.name, it.storage, it.color].filter(Boolean).join(' '),
      }))
      itemDetails.push({
        id: `shipping-${selectedShipping.id}`,
        price: selectedShipping.cost,
        quantity: 1,
        name: `Ongkir ${selectedShipping.label}`,
      })

      const [firstName, ...rest] = form.recipient.trim().split(/\s+/)
      const customerDetails = {
        first_name: firstName || 'Customer',
        last_name: rest.join(' '),
        email: user.email || '',
        phone: form.phone.trim(),
      }

      const { data: paymentResp, error: fnError } = await supabase.functions.invoke(
        'create-payment',
        {
          body: {
            orderId: order.id,
            amount: total,
            customerDetails,
            itemDetails,
          },
        }
      )

      if (fnError) throw fnError
      if (!paymentResp?.token) {
        throw new Error(
          paymentResp?.error || 'Token Midtrans tidak diterima dari server'
        )
      }

      // 5. Simpan token Midtrans ke tabel payments. Kalau gagal, lanjut tetap
      //    buka popup — webhook nanti yang authoritative.
      const { error: paymentInsertError } = await supabase.from('payments').insert({
        order_id: order.id,
        midtrans_token: paymentResp.token,
        midtrans_order_id: paymentResp.order_id || order.id,
        status: 'pending',
      })
      if (paymentInsertError) {
        console.warn(
          '[Checkout] Gagal menyimpan payments row:',
          paymentInsertError.message
        )
      }

      // 6. Buka Snap popup. State submitting di-reset di tiap callback.
      openPayment(paymentResp.token, {
        onSuccess: async () => {
          await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', order.id)
          await supabase
            .from('payments')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('order_id', order.id)
          clearCart()
          navigate(`/order-success?orderId=${order.id}`, { replace: true })
        },
        onPending: async () => {
          await supabase
            .from('orders')
            .update({ status: 'pending' })
            .eq('id', order.id)
          clearCart()
          navigate('/orders?status=pending', { replace: true })
        },
        onError: (result) => {
          console.error('[Midtrans] payment error:', result)
          setSubmitError(
            'Pembayaran gagal diproses. Silakan coba lagi atau pilih metode lain.'
          )
          setSubmitting(false)
        },
        onClose: () => {
          setSubmitError(
            'Pembayaran dibatalkan. Pesanan kamu masih menunggu pembayaran.'
          )
          setSubmitting(false)
        },
      })
    } catch (err) {
      console.error('Checkout error:', err)
      setSubmitError(
        err?.message ||
          'Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.'
      )
      setSubmitting(false)
    }
  }

  if (items.length === 0) return null

  return (
    <main className="bg-canvas-parchment" style={{ minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isDesktop ? '48px 32px 80px' : '32px 20px 64px',
        }}
      >
        <h1
          className="text-display-md text-ink"
          style={{ marginBottom: 32 }}
        >
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '60fr 40fr' : '1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* LEFT COLUMN — FORM SECTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* SECTION 1 — ALAMAT PENGIRIMAN */}
            <section
              className="bg-canvas"
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 18,
                padding: 24,
              }}
            >
              <h2
                className="text-tagline text-ink"
                style={{ marginBottom: 20 }}
              >
                Alamat Pengiriman
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 17 }}>
                <div>
                  <FieldLabel htmlFor="recipient">Nama penerima</FieldLabel>
                  <input
                    id="recipient"
                    type="text"
                    value={form.recipient}
                    onChange={handleChange('recipient')}
                    style={getInputStyle(!!errors.recipient)}
                    autoComplete="name"
                  />
                  <FieldError message={errors.recipient} />
                </div>

                <div>
                  <FieldLabel htmlFor="phone">Nomor telepon</FieldLabel>
                  <input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="08123456789"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    style={getInputStyle(!!errors.phone)}
                    autoComplete="tel"
                  />
                  <FieldError message={errors.phone} />
                </div>

                <div>
                  <FieldLabel htmlFor="address">Alamat lengkap</FieldLabel>
                  <textarea
                    id="address"
                    rows={3}
                    value={form.address}
                    onChange={handleChange('address')}
                    style={{
                      ...getInputStyle(!!errors.address),
                      resize: 'vertical',
                      minHeight: 88,
                    }}
                    autoComplete="street-address"
                  />
                  <FieldError message={errors.address} />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
                    gap: 17,
                  }}
                >
                  <div>
                    <FieldLabel htmlFor="city">Kota</FieldLabel>
                    <input
                      id="city"
                      type="text"
                      value={form.city}
                      onChange={handleChange('city')}
                      style={getInputStyle(!!errors.city)}
                      autoComplete="address-level2"
                    />
                    <FieldError message={errors.city} />
                  </div>

                  <div>
                    <FieldLabel htmlFor="postalCode">Kode pos</FieldLabel>
                    <input
                      id="postalCode"
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={form.postalCode}
                      onChange={handleChange('postalCode')}
                      style={getInputStyle(!!errors.postalCode)}
                      autoComplete="postal-code"
                    />
                    <FieldError message={errors.postalCode} />
                  </div>
                </div>

                <div>
                  <FieldLabel htmlFor="province">Provinsi</FieldLabel>
                  <input
                    id="province"
                    type="text"
                    value={form.province}
                    onChange={handleChange('province')}
                    style={getInputStyle(!!errors.province)}
                    autoComplete="address-level1"
                  />
                  <FieldError message={errors.province} />
                </div>
              </div>
            </section>

            {/* SECTION 2 — PILIH PENGIRIMAN */}
            <section
              className="bg-canvas"
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: 18,
                padding: 24,
              }}
            >
              <h2
                className="text-tagline text-ink"
                style={{ marginBottom: 20 }}
              >
                Pilih Pengiriman
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {SHIPPING_OPTIONS.map((option) => (
                  <ShippingRadioCard
                    key={option.id}
                    option={option}
                    selected={shippingId}
                    onSelect={setShippingId}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN — ORDER SUMMARY */}
          <aside
            style={{
              position: isDesktop ? 'sticky' : 'static',
              top: isDesktop ? 68 : 'auto',
              alignSelf: 'start',
            }}
          >
            <section
              className="bg-canvas-parchment"
              style={{
                background: '#f5f5f7',
                border: '1px solid #e0e0e0',
                borderRadius: 18,
                padding: 24,
              }}
            >
              <h2
                className="text-tagline text-ink"
                style={{ marginBottom: 17 }}
              >
                Ringkasan Pesanan
              </h2>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  borderTop: '1px solid #e0e0e0',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                {items.map((item) => (
                  <OrderSummaryItem
                    key={`${item.productId}-${item.variantId}`}
                    item={item}
                  />
                ))}
              </ul>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  paddingTop: 17,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-body-base text-ink-muted-80">Subtotal</span>
                  <span className="text-body-base text-ink">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-body-base text-ink-muted-80">
                    Ongkos kirim
                  </span>
                  <span className="text-body-base text-ink">
                    {formatRupiah(selectedShipping.cost)}
                  </span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid #e0e0e0',
                  marginTop: 17,
                  paddingTop: 17,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span className="text-body-strong text-ink">Total</span>
                <span className="text-body-strong text-ink" style={{ fontSize: 21 }}>
                  {formatRupiah(total)}
                </span>
              </div>

              {submitError && (
                <p
                  className="text-caption"
                  style={{
                    color: '#d70015',
                    marginTop: 17,
                    padding: 12,
                    background: '#ffffff',
                    borderRadius: 8,
                    border: '1px solid #d70015',
                  }}
                  role="alert"
                >
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary active-scale"
                style={{
                  width: '100%',
                  marginTop: 24,
                  padding: '14px 22px',
                  fontSize: 18,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Memproses…' : 'Bayar Sekarang'}
              </button>

              <p
                className="text-caption text-ink-muted-48"
                style={{ marginTop: 12, textAlign: 'center' }}
              >
                Kamu akan diarahkan ke halaman pembayaran Midtrans
              </p>
            </section>
          </aside>
        </form>
      </div>
    </main>
  )
}
