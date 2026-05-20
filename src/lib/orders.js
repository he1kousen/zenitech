// Helpers untuk halaman order (OrderSuccess, Orders, OrderDetail).
// Hindari duplikasi format dan badge mapping antar halaman.

export const formatRupiah = (n) =>
  `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export const formatDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDateShort = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Display 8 karakter terakhir dari UUID, uppercase.
export const shortOrderId = (id) =>
  id ? `#${String(id).slice(-8).toUpperCase()}` : ''

// Mapping status order ke label + warna badge.
// Single accent (#0066cc) tetap dipakai untuk "paid".
// Kuning, hijau, merah dipakai cuma sebagai status indicator
// (bukan interactive color), jadi tetap konsisten dengan DESIGN.md.
export const STATUS_META = {
  pending: {
    label: 'Menunggu Pembayaran',
    bg: '#f5f5f7',
    fg: '#7a7a7a',
  },
  paid: {
    label: 'Dibayar',
    bg: '#e8f0fe',
    fg: '#0066cc',
  },
  shipped: {
    label: 'Dikirim',
    bg: '#fef9e7',
    fg: '#9a6700',
  },
  delivered: {
    label: 'Selesai',
    bg: '#e6f4ea',
    fg: '#1e7e34',
  },
  cancelled: {
    label: 'Dibatalkan',
    bg: '#fde7e9',
    fg: '#b3261e',
  },
}

export const getStatusMeta = (status) =>
  STATUS_META[status] || STATUS_META.pending

// Step tracker — index step yang sudah tercapai berdasarkan status.
// pending=0 (Menunggu), paid=1 (Diproses), shipped=2 (Dikirim), delivered=3 (Selesai)
// cancelled tetap return 0 supaya step pertama saja yang aktif.
export const STEPS = [
  'Menunggu Pembayaran',
  'Diproses',
  'Dikirim',
  'Selesai',
]

export const stepIndexFromStatus = (status) => {
  switch (status) {
    case 'paid':
      return 1
    case 'shipped':
      return 2
    case 'delivered':
      return 3
    case 'cancelled':
    case 'pending':
    default:
      return 0
  }
}
