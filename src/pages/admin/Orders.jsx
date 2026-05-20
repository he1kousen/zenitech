import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { toast } from '../../store/toastStore'
import {
  formatRupiah,
  formatDateShort,
  shortOrderId,
  getStatusMeta,
} from '../../lib/orders'
import OrderDetail from '../../components/admin/OrderDetail'

const TABS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
]

const cellStyle = {
  padding: '14px 16px',
  borderTop: '1px solid #f0f0f0',
  verticalAlign: 'middle',
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

function TableSkeleton({ rows = 6 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j} style={cellStyle}>
              <div
                style={{
                  height: 14,
                  width: j === 2 ? '80%' : '60%',
                  background: '#f0f0f0',
                  borderRadius: 6,
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}

const productSummary = (items) => {
  if (!items || items.length === 0) return '—'
  const first = items[0]?.products?.name || 'Produk'
  const more = items.length - 1
  return more > 0 ? `${first} +${more} lainnya` : first
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    paid: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  })
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const fetchCounts = useCallback(async () => {
    try {
      const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
      const results = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        ...statuses.map((s) =>
          supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('status', s)
        ),
      ])
      const [allRes, ...rest] = results
      const next = { all: allRes.count || 0 }
      statuses.forEach((s, i) => {
        next[s] = rest[i].count || 0
      })
      setCounts(next)
    } catch (err) {
      console.error('[AdminOrders] counts error:', err)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('orders')
        .select(
          `
          id,
          status,
          total_amount,
          shipping_address,
          created_at,
          order_items ( id, products ( name ) )
          `
        )
        .order('created_at', { ascending: false })
        .limit(100)

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setOrders(data || [])
    } catch (err) {
      console.error('[AdminOrders] fetch error:', err)
      setError(err?.message || 'Gagal memuat pesanan.')
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const refreshAll = () => {
    fetchOrders()
    fetchCounts()
  }

  const openDetail = (id) => {
    setSelectedOrderId(id)
    setDetailOpen(true)
  }

  const visibleOrders = useMemo(() => orders, [orders])

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <h1 className="text-display-md text-ink" style={{ margin: 0 }}>
          Kelola Pesanan
        </h1>
        <p
          className="text-body-base text-ink-muted-48"
          style={{ margin: '8px 0 0' }}
        >
          {counts.all.toLocaleString('id-ID')} pesanan total
        </p>
      </header>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
        role="tablist"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value
          const count = counts[tab.value] || 0
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.value)}
              className="active-scale"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 9999,
                border: `1px solid ${isActive ? '#0066cc' : '#e0e0e0'}`,
                background: isActive ? '#0066cc' : '#ffffff',
                color: isActive ? '#ffffff' : '#1d1d1f',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'SF Pro Text, system-ui, sans-serif',
                letterSpacing: '-0.224px',
                transition: 'background 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? '#ffffff' : '#f0f0f0',
                  color: isActive ? '#0066cc' : '#7a7a7a',
                  padding: '1px 8px',
                  borderRadius: 9999,
                  fontSize: 12,
                  fontWeight: 600,
                  minWidth: 22,
                  textAlign: 'center',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <div
          role="alert"
          className="text-caption"
          style={{
            color: '#b3261e',
            background: '#ffffff',
            border: '1px solid #b3261e',
            borderRadius: 8,
            padding: 17,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Tabel */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: 880,
            }}
          >
            <thead>
              <tr style={{ background: '#fafafc' }}>
                {[
                  'No. Order',
                  'Pembeli',
                  'Produk',
                  'Total',
                  'Status',
                  'Tanggal',
                  'Aksi',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-caption-strong text-ink-muted-48"
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            {loading ? (
              <TableSkeleton />
            ) : visibleOrders.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={7}
                    className="text-body-base text-ink-muted-48"
                    style={{ padding: '32px 16px', textAlign: 'center' }}
                  >
                    Tidak ada pesanan.
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {visibleOrders.map((order) => {
                  const addr = order.shipping_address || {}
                  return (
                    <tr
                      key={order.id}
                      onClick={() => openDetail(order.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td
                        className="text-caption-strong text-ink"
                        style={{ ...cellStyle, whiteSpace: 'nowrap' }}
                      >
                        {shortOrderId(order.id)}
                      </td>
                      <td style={cellStyle}>
                        <p
                          className="text-caption-strong text-ink"
                          style={{
                            margin: 0,
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {addr.recipient || '—'}
                        </p>
                        <p
                          className="text-fine-print text-ink-muted-48"
                          style={{
                            margin: '2px 0 0',
                            maxWidth: 180,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {addr.phone || ''}
                        </p>
                      </td>
                      <td
                        className="text-caption text-ink"
                        style={{
                          ...cellStyle,
                          maxWidth: 220,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {productSummary(order.order_items)}
                      </td>
                      <td
                        className="text-caption-strong text-ink"
                        style={{ ...cellStyle, whiteSpace: 'nowrap' }}
                      >
                        {formatRupiah(order.total_amount)}
                      </td>
                      <td style={cellStyle}>
                        <StatusBadge status={order.status} />
                      </td>
                      <td
                        className="text-caption text-ink-muted-48"
                        style={{ ...cellStyle, whiteSpace: 'nowrap' }}
                      >
                        {formatDateShort(order.created_at)}
                      </td>
                      <td style={cellStyle} onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openDetail(order.id)}
                          className="btn-primary active-scale"
                          style={{ padding: '6px 14px', fontSize: 14 }}
                        >
                          Proses
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <OrderDetail
        open={detailOpen}
        orderId={selectedOrderId}
        onClose={() => setDetailOpen(false)}
        onUpdated={() => {
          toast.success('Status pesanan diperbarui')
          refreshAll()
        }}
      />
    </div>
  )
}
