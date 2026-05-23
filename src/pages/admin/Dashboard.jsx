import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import AnimatedText from '../../components/ui/AnimatedText'
import {
  formatRupiah,
  formatDateShort,
  shortOrderId,
  getStatusMeta,
} from '../../lib/orders'

const CARD_STYLE = {
  background: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: 18,
  padding: 24,
  position: 'relative',
}

function StatCard({ label, value, icon, loading }) {
  return (
    <div style={CARD_STYLE}>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          fontSize: 22,
          lineHeight: 1,
          opacity: 0.6,
        }}
      >
        {icon}
      </span>
      <p className="text-caption-strong text-ink-muted-48" style={{ margin: 0 }}>
        {label}
      </p>
      {loading ? (
        <div
          style={{
            marginTop: 12,
            height: 40,
            width: '60%',
            background: '#f0f0f0',
            borderRadius: 8,
          }}
        />
      ) : (
        <p
          className="text-display-md text-ink"
          style={{ margin: '12px 0 0' }}
        >
          {value}
        </p>
      )}
    </div>
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

function TableSkeleton({ rows = 5 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 5 }).map((__, j) => (
            <td
              key={j}
              style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}
            >
              <div
                style={{
                  height: 14,
                  width: j === 1 ? '70%' : '50%',
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

function OrdersTable({ orders, loading }) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: 18,
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <h2 className="text-body-strong text-ink" style={{ margin: 0 }}>
          Pesanan Terbaru
        </h2>
        <Link to="/admin/orders" className="text-link text-caption-strong">
          Lihat Semua →
        </Link>
      </header>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: 640,
          }}
        >
          <thead>
            <tr style={{ background: '#fafafc' }}>
              {['No. Order', 'Pembeli', 'Total', 'Status', 'Tanggal'].map((h) => (
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
          ) : orders.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="text-body-base text-ink-muted-48"
                  style={{ padding: '32px 16px', textAlign: 'center' }}
                >
                  Belum ada pesanan.
                </td>
              </tr>
            </tbody>
          ) : (
            <motion.tbody
              initial={prefersReducedMotion ? false : "hidden"}
              animate={prefersReducedMotion ? false : "visible"}
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
                hidden: {}
              }}
            >
              {orders.map((order) => (
                <motion.tr 
                  key={order.id}
                  variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                >
                  <td
                    className="text-caption-strong text-ink"
                    style={{
                      padding: '14px 16px',
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-link"
                    >
                      {shortOrderId(order.id)}
                    </Link>
                  </td>
                  <td
                    className="text-caption text-ink"
                    style={{
                      padding: '14px 16px',
                      borderTop: '1px solid #f0f0f0',
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {order.buyer_name || order.shipping_address?.recipient_name || '—'}
                  </td>
                  <td
                    className="text-caption-strong text-ink"
                    style={{
                      padding: '14px 16px',
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    {formatRupiah(order.total_amount)}
                  </td>
                  <td
                    style={{
                      padding: '14px 16px',
                      borderTop: '1px solid #f0f0f0',
                    }}
                  >
                    <StatusBadge status={order.status} />
                  </td>
                  <td
                    className="text-caption text-ink-muted-48"
                    style={{
                      padding: '14px 16px',
                      borderTop: '1px solid #f0f0f0',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDateShort(order.created_at)}
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          )}
        </table>
      </div>
    </div>
  )
}

const monthStartIso = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    monthRevenue: 0,
    activeProducts: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchStats = async () => {
      setStatsLoading(true)
      try {
        const startOfMonth = monthStartIso()

        const [
          totalRes,
          pendingRes,
          revenueRes,
          productsRes,
        ] = await Promise.all([
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending'),
          supabase
            .from('orders')
            .select('total_amount')
            .in('status', ['paid', 'shipped', 'delivered'])
            .gte('created_at', startOfMonth),
          supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true),
        ])

        if (totalRes.error) throw totalRes.error
        if (pendingRes.error) throw pendingRes.error
        if (revenueRes.error) throw revenueRes.error
        if (productsRes.error) throw productsRes.error

        const monthRevenue = (revenueRes.data || []).reduce(
          (sum, row) => sum + Number(row.total_amount || 0),
          0
        )

        if (!cancelled) {
          setStats({
            totalOrders: totalRes.count || 0,
            pendingOrders: pendingRes.count || 0,
            monthRevenue,
            activeProducts: productsRes.count || 0,
          })
        }
      } catch (err) {
        console.error('[Dashboard] stats error:', err)
        if (!cancelled) setError(err?.message || 'Gagal memuat statistik.')
      } finally {
        if (!cancelled) setStatsLoading(false)
      }
    }

    const fetchRecent = async () => {
      setOrdersLoading(true)
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select(
            `
            id,
            status,
            total_amount,
            shipping_address,
            created_at
            `
          )
          .order('created_at', { ascending: false })
          .limit(10)

        if (fetchError) throw fetchError

        if (!cancelled) {
          setRecentOrders(
            (data || []).map((o) => ({
              ...o,
              buyer_name: o.shipping_address?.recipient_name || '—',
            }))
          )
        }
      } catch (err) {
        console.error('[Dashboard] recent orders error:', err)
        if (!cancelled) setError(err?.message || 'Gagal memuat pesanan terbaru.')
      } finally {
        if (!cancelled) setOrdersLoading(false)
      }
    }

    fetchStats()
    fetchRecent()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <header style={{ marginBottom: 32 }}>
        <h1 className="text-display-md text-ink" style={{ margin: 0 }}>
          <AnimatedText animation="splitWords">Dashboard</AnimatedText>
        </h1>
        <p
          className="text-body-base text-ink-muted-48"
          style={{ margin: '8px 0 0' }}
        >
          Ringkasan aktivitas toko Zenitech.
        </p>
      </header>

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
            marginBottom: 24,
          }}
        >
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
          marginBottom: 32,
        }}
      >
        <StatCard
          label="Total Order"
          value={stats.totalOrders.toLocaleString('id-ID')}
          icon="🛒"
          loading={statsLoading}
        />
        <StatCard
          label="Order Pending"
          value={stats.pendingOrders.toLocaleString('id-ID')}
          icon="⏳"
          loading={statsLoading}
        />
        <StatCard
          label="Revenue Bulan Ini"
          value={formatRupiah(stats.monthRevenue)}
          icon="💰"
          loading={statsLoading}
        />
        <StatCard
          label="Produk Aktif"
          value={stats.activeProducts.toLocaleString('id-ID')}
          icon="📦"
          loading={statsLoading}
        />
      </section>

      {/* Recent Orders */}
      <OrdersTable orders={recentOrders} loading={ordersLoading} />
    </div>
  )
}
