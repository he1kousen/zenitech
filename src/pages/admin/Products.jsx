import { useEffect, useState, useCallback } from 'react'
import { supabase, getImageUrl } from '../../lib/supabase'
import { formatRupiah } from '../../lib/orders'
import { toast } from '../../store/toastStore'
import ProductForm from '../../components/admin/ProductForm'

const PAGE_SIZE = 15

const cellStyle = {
  padding: '14px 16px',
  borderTop: '1px solid #f0f0f0',
  verticalAlign: 'middle',
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="active-scale"
      style={{
        width: 40,
        height: 24,
        borderRadius: 9999,
        background: checked ? '#0066cc' : '#e0e0e0',
        border: 'none',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s ease',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 19 : 3,
          width: 18,
          height: 18,
          background: '#ffffff',
          borderRadius: '50%',
          transition: 'left 0.15s ease',
        }}
      />
    </button>
  )
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.3 2.7l2 2-7.6 7.6-2.4.4.4-2.4 7.6-7.6z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 4h10M6 4V2.5h4V4M5 4l.5 9a1 1 0 001 1h3a1 1 0 001-1L11 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ConfirmDialog({ open, title, message, onCancel, onConfirm, busy }) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 110,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          padding: 24,
          maxWidth: 400,
          width: '100%',
        }}
      >
        <h3 className="text-display-md text-ink" style={{ margin: '0 0 12px' }}>
          {title}
        </h3>
        <p className="text-body-base text-ink-muted-48" style={{ margin: '0 0 24px' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn-secondary-pill active-scale"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="active-scale"
            style={{
              background: '#b3261e',
              color: '#ffffff',
              border: 'none',
              borderRadius: 9999,
              padding: '11px 22px',
              fontSize: 17,
              fontFamily: 'SF Pro Text, system-ui, sans-serif',
              letterSpacing: '-0.374px',
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Menghapus…' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TableSkeleton({ rows = 8 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j} style={cellStyle}>
              <div
                style={{
                  height: j === 0 ? 48 : 14,
                  width: j === 0 ? 48 : '70%',
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

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  const [confirmDelete, setConfirmDelete] = useState(null) // product object
  const [deleting, setDeleting] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const from = (page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('products')
        .select(
          `
          id,
          name,
          slug,
          base_price,
          is_active,
          description,
          category_id,
          created_at,
          category:categories ( id, name ),
          images:product_images ( id, url, is_primary, sort_order ),
          variants:product_variants ( id, storage, color, price_modifier, stock, sku )
          `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`)
      }

      const { data, count, error: fetchError } = await query
      if (fetchError) throw fetchError

      setProducts(data || [])
      setTotal(count || 0)
    } catch (err) {
      console.error('[AdminProducts] fetch error:', err)
      setError(err?.message || 'Gagal memuat produk.')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const openCreate = () => {
    setEditingProduct(null)
    setFormOpen(true)
  }

  const openEdit = (product) => {
    setEditingProduct(product)
    setFormOpen(true)
  }

  const toggleActive = async (product) => {
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, is_active: !p.is_active } : p
      )
    )
    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)
      if (updateError) throw updateError
      toast.success(
        product.is_active
          ? `${product.name} dinonaktifkan`
          : `${product.name} diaktifkan`
      )
    } catch (err) {
      console.error('[AdminProducts] toggle error:', err)
      const msg = err?.message || 'Gagal mengubah status.'
      setError(msg)
      toast.error(msg)
      // rollback
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: product.is_active } : p
        )
      )
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      // Hapus child rows dulu (FK cascade tidak diasumsikan)
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', confirmDelete.id)
      await supabase
        .from('product_variants')
        .delete()
        .eq('product_id', confirmDelete.id)

      const { error: delErr } = await supabase
        .from('products')
        .delete()
        .eq('id', confirmDelete.id)
      if (delErr) throw delErr

      toast.success(`Produk "${confirmDelete.name}" dihapus`)
      setConfirmDelete(null)
      fetchProducts()
    } catch (err) {
      console.error('[AdminProducts] delete error:', err)
      const msg = err?.message || 'Gagal menghapus produk.'
      setError(msg)
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

  const getThumbnail = (product) => {
    const imgs = product.images || []
    const primary = imgs.find((x) => x.is_primary)
    return primary?.url || imgs[0]?.url || null
  }

  const getTotalStock = (product) =>
    (product.variants || []).reduce(
      (sum, v) => sum + Number(v.stock || 0),
      0
    )

  return (
    <div>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="text-display-md text-ink" style={{ margin: 0 }}>
            Kelola Produk
          </h1>
          <p
            className="text-body-base text-ink-muted-48"
            style={{ margin: '8px 0 0' }}
          >
            {total.toLocaleString('id-ID')} produk total
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary active-scale"
        >
          + Tambah Produk
        </button>
      </header>

      {/* Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        style={{ marginBottom: 16, display: 'flex', gap: 8 }}
      >
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari produk berdasarkan nama…"
          style={{
            flex: 1,
            maxWidth: 400,
            padding: '10px 16px',
            border: '1px solid #e0e0e0',
            borderRadius: 9999,
            fontFamily: 'SF Pro Text, system-ui, sans-serif',
            fontSize: 14,
            letterSpacing: '-0.224px',
            background: '#ffffff',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          className="btn-secondary-pill active-scale"
          style={{ padding: '8px 18px', fontSize: 14 }}
        >
          Cari
        </button>
      </form>

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
                  'Foto',
                  'Nama',
                  'Kategori',
                  'Harga Dasar',
                  'Stok',
                  'Status',
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
            ) : products.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={7}
                    className="text-body-base text-ink-muted-48"
                    style={{ padding: '32px 16px', textAlign: 'center' }}
                  >
                    Tidak ada produk.
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {products.map((product) => {
                  const thumb = getThumbnail(product)
                  const stock = getTotalStock(product)
                  return (
                    <tr key={product.id}>
                      <td style={cellStyle}>
                        <div
                          style={{
                            width: 56,
                            height: 56,
                            borderRadius: 8,
                            background: '#fafafc',
                            border: '1px solid #e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {thumb ? (
                            <img
                              src={getImageUrl(thumb, 'thumb')}
                              alt={product.name}
                              loading="lazy"
                              style={{
                                width: '85%',
                                height: '85%',
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <span className="text-fine-print text-ink-muted-48">
                              N/A
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <p className="text-body-strong text-ink" style={{ margin: 0 }}>
                          {product.name}
                        </p>
                        <p
                          className="text-fine-print text-ink-muted-48"
                          style={{ margin: '2px 0 0' }}
                        >
                          {product.slug}
                        </p>
                      </td>
                      <td
                        className="text-caption text-ink"
                        style={cellStyle}
                      >
                        {product.category?.name || '—'}
                      </td>
                      <td
                        className="text-caption-strong text-ink"
                        style={{ ...cellStyle, whiteSpace: 'nowrap' }}
                      >
                        {formatRupiah(product.base_price)}
                      </td>
                      <td
                        className="text-caption text-ink"
                        style={cellStyle}
                      >
                        {stock.toLocaleString('id-ID')}
                      </td>
                      <td style={cellStyle}>
                        <div
                          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                          <ToggleSwitch
                            checked={!!product.is_active}
                            onChange={() => toggleActive(product)}
                          />
                          <span className="text-fine-print text-ink-muted-48">
                            {product.is_active ? 'Aktif' : 'Non-aktif'}
                          </span>
                        </div>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            aria-label="Edit"
                            className="active-scale"
                            style={{
                              width: 32,
                              height: 32,
                              border: '1px solid #e0e0e0',
                              background: '#ffffff',
                              color: '#1d1d1f',
                              borderRadius: 8,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(product)}
                            aria-label="Hapus"
                            className="active-scale"
                            style={{
                              width: 32,
                              height: 32,
                              border: '1px solid #e0e0e0',
                              background: '#ffffff',
                              color: '#b3261e',
                              borderRadius: 8,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > 0 && (
          <footer
            style={{
              padding: '16px 24px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <p
              className="text-caption text-ink-muted-48"
              style={{ margin: 0 }}
            >
              Halaman {page} dari {totalPages}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="active-scale"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  background: '#ffffff',
                  borderRadius: 9999,
                  fontSize: 14,
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1,
                  fontFamily: 'SF Pro Text, system-ui, sans-serif',
                  letterSpacing: '-0.224px',
                }}
              >
                ← Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="active-scale"
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e0e0e0',
                  background: '#ffffff',
                  borderRadius: 9999,
                  fontSize: 14,
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1,
                  fontFamily: 'SF Pro Text, system-ui, sans-serif',
                  letterSpacing: '-0.224px',
                }}
              >
                Berikutnya →
              </button>
            </div>
          </footer>
        )}
      </div>

      {/* Form modal */}
      <ProductForm
        open={formOpen}
        product={editingProduct}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false)
          toast.success(editingProduct ? 'Produk diperbarui' : 'Produk ditambahkan')
          fetchProducts()
        }}
      />

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Hapus Produk?"
        message={`Produk "${confirmDelete?.name}" beserta foto dan varian akan dihapus permanen.`}
        busy={deleting}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
