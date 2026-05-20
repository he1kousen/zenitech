import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { toast } from '../../store/toastStore'

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

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

const cellStyle = {
  padding: '14px 16px',
  borderTop: '1px solid #f0f0f0',
  verticalAlign: 'middle',
}

function CategoryFormModal({ open, category, onClose, onSaved }) {
  const isEdit = !!category?.id

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSlugTouched(false)
    if (isEdit) {
      setName(category.name || '')
      setSlug(category.slug || '')
      setIcon(category.icon_url || '')
    } else {
      setName('')
      setSlug('')
      setIcon('')
    }
  }, [open, category, isEdit])

  useEffect(() => {
    if (slugTouched || isEdit) return
    setSlug(slugify(name))
  }, [name, slugTouched, isEdit])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nama kategori wajib diisi.')
      return
    }
    if (!slug.trim()) {
      setError('Slug wajib diisi.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        icon_url: icon.trim() || null,
      }

      if (isEdit) {
        const { error: updateErr } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', category.id)
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase
          .from('categories')
          .insert(payload)
        if (insertErr) throw insertErr
      }

      onSaved?.()
      onClose?.()
    } catch (err) {
      console.error('[Categories] save error:', err)
      setError(err?.message || 'Gagal menyimpan kategori.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

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
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          width: '100%',
          maxWidth: 480,
        }}
      >
        <header
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 className="text-display-md text-ink" style={{ margin: 0 }}>
            {isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
          </h2>
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
        </header>

        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label
              className="text-caption-strong text-ink"
              style={{ display: 'block', marginBottom: 6 }}
            >
              Nama Kategori <span style={{ color: '#b3261e' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              required
              placeholder="iPhone"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              className="text-caption-strong text-ink"
              style={{ display: 'block', marginBottom: 6 }}
            >
              Slug <span style={{ color: '#b3261e' }}>*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(slugify(e.target.value))
              }}
              style={inputStyle}
              required
              placeholder="iphone"
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              className="text-caption-strong text-ink"
              style={{ display: 'block', marginBottom: 6 }}
            >
              Icon (emoji)
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              style={{ ...inputStyle, fontSize: 22, textAlign: 'center' }}
              placeholder="📱"
              maxLength={4}
            />
            <p
              className="text-fine-print text-ink-muted-48"
              style={{ margin: '6px 0 0' }}
            >
              Boleh dikosongkan. Gunakan emoji sederhana (📱 💻 🎧).
            </p>
          </div>

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
                marginBottom: 16,
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
            {submitting ? 'Menyimpan…' : 'Simpan Kategori'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ConfirmDialog({ open, title, message, busy, onCancel, onConfirm, disabled }) {
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
        <p
          className="text-body-base text-ink-muted-48"
          style={{ margin: '0 0 24px' }}
        >
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
          {!disabled && (
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
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const [confirmTarget, setConfirmTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: cats, error: catErr } = await supabase
        .from('categories')
        .select('id, name, slug, icon_url')
        .order('name', { ascending: true })
      if (catErr) throw catErr

      // Hitung produk per kategori (total + aktif) lewat query terpisah supaya
      // tidak tergantung relationship di schema cache.
      const enriched = await Promise.all(
        (cats || []).map(async (c) => {
          const [totalRes, activeRes] = await Promise.all([
            supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', c.id),
            supabase
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', c.id)
              .eq('is_active', true),
          ])
          return {
            ...c,
            product_count: totalRes.count || 0,
            active_count: activeRes.count || 0,
          }
        })
      )

      setCategories(enriched)
    } catch (err) {
      console.error('[Categories] fetch error:', err)
      setError(err?.message || 'Gagal memuat kategori.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (category) => {
    setEditing(category)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (!confirmTarget) return
    if (confirmTarget.active_count > 0) return // safety
    setDeleting(true)
    try {
      const { error: delErr } = await supabase
        .from('categories')
        .delete()
        .eq('id', confirmTarget.id)
      if (delErr) throw delErr

      toast.success(`Kategori "${confirmTarget.name}" dihapus`)
      setConfirmTarget(null)
      fetchCategories()
    } catch (err) {
      console.error('[Categories] delete error:', err)
      const msg = err?.message || 'Gagal menghapus kategori.'
      setError(msg)
      toast.error(msg)
    } finally {
      setDeleting(false)
    }
  }

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
            Kategori
          </h1>
          <p
            className="text-body-base text-ink-muted-48"
            style={{ margin: '8px 0 0' }}
          >
            {categories.length.toLocaleString('id-ID')} kategori
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary active-scale"
        >
          + Tambah Kategori
        </button>
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
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

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
              minWidth: 600,
            }}
          >
            <thead>
              <tr style={{ background: '#fafafc' }}>
                {['Icon', 'Nama', 'Slug', 'Produk', 'Aksi'].map((h) => (
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
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} style={cellStyle}>
                        <div
                          style={{
                            height: 14,
                            width: '60%',
                            background: '#f0f0f0',
                            borderRadius: 6,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : categories.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={5}
                    className="text-body-base text-ink-muted-48"
                    style={{ padding: '32px 16px', textAlign: 'center' }}
                  >
                    Belum ada kategori. Tambahkan kategori pertama.
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {categories.map((c) => {
                  const blockedDelete = c.active_count > 0
                  return (
                    <tr key={c.id}>
                      <td style={{ ...cellStyle, fontSize: 22 }}>
                        {c.icon_url || '—'}
                      </td>
                      <td
                        className="text-caption-strong text-ink"
                        style={cellStyle}
                      >
                        {c.name}
                      </td>
                      <td
                        className="text-caption text-ink-muted-80"
                        style={cellStyle}
                      >
                        {c.slug}
                      </td>
                      <td
                        className="text-caption text-ink"
                        style={cellStyle}
                      >
                        {c.active_count} aktif{' '}
                        <span className="text-fine-print text-ink-muted-48">
                          ({c.product_count} total)
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="btn-secondary-pill active-scale"
                            style={{ padding: '6px 14px', fontSize: 14 }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmTarget(c)}
                            disabled={blockedDelete}
                            title={
                              blockedDelete
                                ? 'Tidak bisa hapus: masih ada produk aktif'
                                : 'Hapus kategori'
                            }
                            className="active-scale"
                            style={{
                              background: '#ffffff',
                              color: blockedDelete ? '#cccccc' : '#b3261e',
                              border: `1px solid ${
                                blockedDelete ? '#e0e0e0' : '#b3261e'
                              }`,
                              borderRadius: 9999,
                              padding: '6px 14px',
                              fontSize: 14,
                              cursor: blockedDelete ? 'not-allowed' : 'pointer',
                              fontFamily: 'SF Pro Text, system-ui, sans-serif',
                              letterSpacing: '-0.224px',
                            }}
                          >
                            Hapus
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
      </div>

      {/* Form modal */}
      <CategoryFormModal
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false)
          toast.success(editing ? 'Kategori diperbarui' : 'Kategori ditambahkan')
          fetchCategories()
        }}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!confirmTarget}
        title={
          confirmTarget?.active_count > 0
            ? 'Tidak dapat menghapus'
            : 'Hapus Kategori?'
        }
        message={
          confirmTarget?.active_count > 0
            ? `Kategori "${confirmTarget.name}" masih punya ${confirmTarget.active_count} produk aktif. Non-aktifkan atau pindahkan produk dulu sebelum menghapus.`
            : `Kategori "${confirmTarget?.name}" akan dihapus permanen.`
        }
        busy={deleting}
        disabled={confirmTarget?.active_count > 0}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  )
}
