import { useEffect, useRef, useState } from 'react'
import { supabase, getImageUrl } from '../../lib/supabase'
import { useCategories } from '../../hooks/useCategories'
import { useImageUpload } from '../../hooks/useImageUpload'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const slugify = (str) =>
  String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const blankVariant = () => ({
  id: null,
  storage: '',
  color: '',
  price_modifier: 0,
  stock: 0,
  sku: '',
})

const labelStyle = {
  display: 'block',
  marginBottom: 6,
}

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

const sectionStyle = {
  marginBottom: 32,
  paddingBottom: 24,
  borderBottom: '1px solid #f0f0f0',
}

function FieldLabel({ children, required }) {
  return (
    <label className="text-caption-strong text-ink" style={labelStyle}>
      {children}
      {required && <span style={{ color: '#b3261e' }}> *</span>}
    </label>
  )
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
        width: 44,
        height: 26,
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
          left: checked ? 21 : 3,
          width: 20,
          height: 20,
          background: '#ffffff',
          borderRadius: '50%',
          transition: 'left 0.15s ease',
        }}
      />
    </button>
  )
}

export default function ProductForm({ open, product, onClose, onSaved }) {
  const isEdit = !!product?.id
  const { categories } = useCategories()
  const fileInputRef = useRef(null)
  const { uploadImage, deleteImage } = useImageUpload({ folder: 'products' })

  const [form, setForm] = useState({
    name: '',
    slug: '',
    category_id: '',
    base_price: 0,
    description: '',
    is_active: true,
  })
  const [slugTouched, setSlugTouched] = useState(false)
  const [images, setImages] = useState([])
  // images: [{ id?, url, file?, is_primary, sort_order, uploading?, error?, isNew? }]
  const [variants, setVariants] = useState([blankVariant()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  // Hydrate form ketika modal dibuka
  useEffect(() => {
    if (!open) return
    setError(null)
    setSlugTouched(false)

    if (isEdit) {
      setForm({
        name: product.name || '',
        slug: product.slug || '',
        category_id: product.category_id || '',
        base_price: product.base_price ?? 0,
        description: product.description || '',
        is_active: product.is_active ?? true,
      })
      const sortedImages = (product.images || product.product_images || [])
        .slice()
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img) => ({
          id: img.id,
          url: img.url,
          is_primary: !!img.is_primary,
          sort_order: img.sort_order || 0,
          isNew: false,
        }))
      setImages(sortedImages)

      const v = product.variants || product.product_variants || []
      setVariants(
        v.length > 0
          ? v.map((x) => ({
              id: x.id,
              storage: x.storage || '',
              color: x.color || '',
              price_modifier: Number(x.price_modifier || 0),
              stock: Number(x.stock || 0),
              sku: x.sku || '',
            }))
          : [blankVariant()]
      )
    } else {
      setForm({
        name: '',
        slug: '',
        category_id: '',
        base_price: 0,
        description: '',
        is_active: true,
      })
      setImages([])
      setVariants([blankVariant()])
    }
  }, [open, product, isEdit])

  // Auto-generate slug dari nama, kecuali user sudah edit slug manual
  useEffect(() => {
    if (slugTouched || isEdit) return
    setForm((f) => ({ ...f, slug: slugify(f.name) }))
  }, [form.name, slugTouched, isEdit])

  const updateForm = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }))

  // ===== Image handlers =====
  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Format tidak didukung. Gunakan JPG/PNG/WebP.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Ukuran file maks 5MB.'
    }
    return null
  }

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || [])
    if (files.length === 0) return

    setImages((prev) => {
      const next = [...prev]
      files.forEach((file) => {
        const err = validateFile(file)
        const previewUrl = URL.createObjectURL(file)
        next.push({
          id: null,
          url: previewUrl,
          file,
          is_primary: false,
          sort_order: next.length,
          isNew: true,
          error: err,
        })
      })
      // Pastikan ada primary
      if (!next.some((img) => img.is_primary && !img.error)) {
        const firstValid = next.find((img) => !img.error)
        if (firstValid) firstValid.is_primary = true
      }
      return next
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeImage = (idx) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx)
      if (!next.some((img) => img.is_primary) && next.length > 0) {
        next[0].is_primary = true
      }
      return next
    })
  }

  const setPrimaryImage = (idx) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === idx }))
    )
  }

  // ===== Variant handlers =====
  const addVariant = () => setVariants((v) => [...v, blankVariant()])

  const removeVariant = (idx) =>
    setVariants((v) => (v.length === 1 ? v : v.filter((_, i) => i !== idx)))

  const updateVariant = (idx, field, value) => {
    setVariants((v) =>
      v.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    )
  }

  // ===== Upload single image to Supabase Storage =====
  // Pakai useImageUpload hook untuk konsistensi validasi + naming.
  const handleUpload = async (file, productId) => {
    const { url } = await uploadImage(file, { folder: `products/${productId}` })
    return url
  }

  // ===== Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validasi dasar
    if (!form.name.trim()) {
      setError('Nama produk wajib diisi.')
      return
    }
    if (!form.slug.trim()) {
      setError('Slug wajib diisi.')
      return
    }
    if (!form.category_id) {
      setError('Kategori wajib dipilih.')
      return
    }
    if (Number(form.base_price) <= 0) {
      setError('Harga dasar harus lebih dari 0.')
      return
    }
    if (variants.length === 0) {
      setError('Minimal 1 varian harus ada.')
      return
    }
    if (images.some((img) => img.error)) {
      setError('Ada foto yang tidak valid. Hapus dulu sebelum simpan.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Upsert produk
      const productPayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category_id: form.category_id,
        base_price: Number(form.base_price),
        description: form.description.trim(),
        is_active: form.is_active,
      }

      let productId = product?.id
      if (isEdit) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productId)
        if (updateError) throw updateError
      } else {
        const { data, error: insertError } = await supabase
          .from('products')
          .insert(productPayload)
          .select('id')
          .single()
        if (insertError) throw insertError
        productId = data.id
      }

      // 2. Upload gambar baru
      const finalImages = []
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        if (img.isNew && img.file) {
          const publicUrl = await handleUpload(img.file, productId)
          finalImages.push({
            url: publicUrl,
            is_primary: img.is_primary,
            sort_order: i,
          })
        } else if (img.id) {
          finalImages.push({
            id: img.id,
            url: img.url,
            is_primary: img.is_primary,
            sort_order: i,
          })
        }
      }

      // 3. Sinkronisasi product_images
      if (isEdit) {
        // Hapus image lama yang tidak ada di finalImages
        const keepIds = finalImages.filter((x) => x.id).map((x) => x.id)
        const oldImages = product.images || product.product_images || []
        const toDelete = oldImages.filter((img) => !keepIds.includes(img.id))

        if (toDelete.length > 0) {
          // Hapus row di product_images dulu
          const { error: delErr } = await supabase
            .from('product_images')
            .delete()
            .in(
              'id',
              toDelete.map((x) => x.id)
            )
          if (delErr) throw delErr

          // Hapus file di Storage (best-effort, jangan block kalau gagal)
          for (const img of toDelete) {
            try {
              await deleteImage(img.url)
            } catch (storageErr) {
              console.warn(
                '[ProductForm] gagal hapus file storage:',
                img.url,
                storageErr
              )
            }
          }
        }

        // Update existing (is_primary, sort_order)
        for (const img of finalImages.filter((x) => x.id)) {
          const { error: upErr } = await supabase
            .from('product_images')
            .update({
              is_primary: img.is_primary,
              sort_order: img.sort_order,
            })
            .eq('id', img.id)
          if (upErr) throw upErr
        }
      }

      // Insert image baru
      const newImagesToInsert = finalImages
        .filter((x) => !x.id)
        .map((x) => ({
          product_id: productId,
          url: x.url,
          is_primary: x.is_primary,
          sort_order: x.sort_order,
        }))
      if (newImagesToInsert.length > 0) {
        const { error: insErr } = await supabase
          .from('product_images')
          .insert(newImagesToInsert)
        if (insErr) throw insErr
      }

      // 4. Sinkronisasi variants — strategi: hapus semua, insert ulang
      // Lebih sederhana dan menjaga konsistensi.
      if (isEdit) {
        const { error: delVarErr } = await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', productId)
        if (delVarErr) throw delVarErr
      }

      const variantPayload = variants.map((v) => ({
        product_id: productId,
        storage: v.storage.trim() || null,
        color: v.color.trim() || null,
        price_modifier: Number(v.price_modifier || 0),
        stock: Number(v.stock || 0),
        sku: v.sku.trim() || null,
      }))
      const { error: varErr } = await supabase
        .from('product_variants')
        .insert(variantPayload)
      if (varErr) throw varErr

      onSaved?.()
      onClose?.()
    } catch (err) {
      console.error('[ProductForm] submit error:', err)
      setError(err?.message || 'Gagal menyimpan produk.')
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
          background: '#ffffff',
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
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 className="text-display-md text-ink" style={{ margin: 0 }}>
            {isEdit ? 'Edit Produk' : 'Tambah Produk'}
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ padding: 24, overflowY: 'auto', flex: 1 }}
        >
          {/* Section 1 - Informasi Dasar */}
          <section style={sectionStyle}>
            <h3 className="text-body-strong text-ink" style={{ margin: '0 0 16px' }}>
              Informasi Dasar
            </h3>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Nama Produk</FieldLabel>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                style={inputStyle}
                required
                placeholder="iPhone 17 Pro"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel required>Slug</FieldLabel>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  updateForm('slug', slugify(e.target.value))
                }}
                style={inputStyle}
                required
                placeholder="iphone-17-pro"
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div>
                <FieldLabel required>Kategori</FieldLabel>
                <select
                  value={form.category_id}
                  onChange={(e) => updateForm('category_id', e.target.value)}
                  style={inputStyle}
                  required
                >
                  <option value="">Pilih kategori…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel required>Harga Dasar (Rp)</FieldLabel>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.base_price}
                  onChange={(e) => updateForm('base_price', e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FieldLabel>Deskripsi</FieldLabel>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
                placeholder="Tulis deskripsi produk…"
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <ToggleSwitch
                checked={form.is_active}
                onChange={(v) => updateForm('is_active', v)}
              />
              <span className="text-caption-strong text-ink">
                Status: {form.is_active ? 'Aktif' : 'Non-aktif'}
              </span>
            </div>
          </section>

          {/* Section 2 - Foto */}
          <section style={sectionStyle}>
            <h3 className="text-body-strong text-ink" style={{ margin: '0 0 16px' }}>
              Foto Produk
            </h3>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#0066cc' : '#e0e0e0'}`,
                background: dragOver ? '#fafafc' : '#ffffff',
                borderRadius: 18,
                padding: 32,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: 16,
              }}
            >
              <p className="text-body-base text-ink" style={{ margin: 0 }}>
                Klik atau drag &amp; drop foto di sini
              </p>
              <p
                className="text-caption text-ink-muted-48"
                style={{ margin: '6px 0 0' }}
              >
                JPG/PNG/WebP, maks 5MB per file. Bisa upload multiple sekaligus.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  handleFiles(e.target.files)
                  e.target.value = ''
                }}
                style={{ display: 'none' }}
              />
            </div>

            {images.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                  gap: 12,
                }}
              >
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: 11,
                      overflow: 'hidden',
                      border: img.is_primary
                        ? '2px solid #0066cc'
                        : '1px solid #e0e0e0',
                      background: '#fafafc',
                      cursor: 'pointer',
                    }}
                    onClick={() => setPrimaryImage(idx)}
                  >
                    <img
                      src={img.isNew ? img.url : getImageUrl(img.url, 'thumb')}
                      alt=""
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                    {img.is_primary && (
                      <span
                        className="text-fine-print"
                        style={{
                          position: 'absolute',
                          bottom: 6,
                          left: 6,
                          background: '#0066cc',
                          color: '#ffffff',
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        Utama
                      </span>
                    )}
                    {img.error && (
                      <span
                        className="text-fine-print"
                        style={{
                          position: 'absolute',
                          bottom: 6,
                          left: 6,
                          right: 6,
                          background: '#b3261e',
                          color: '#ffffff',
                          padding: '2px 6px',
                          borderRadius: 4,
                          textAlign: 'center',
                        }}
                      >
                        {img.error}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage(idx)
                      }}
                      aria-label="Hapus foto"
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 24,
                        height: 24,
                        border: 'none',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#ffffff',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        fontSize: 14,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section 3 - Varian */}
          <section style={sectionStyle}>
            <header
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h3 className="text-body-strong text-ink" style={{ margin: 0 }}>
                Varian Produk
              </h3>
              <button
                type="button"
                onClick={addVariant}
                className="active-scale"
                style={{
                  background: '#0066cc',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 9999,
                  padding: '6px 14px',
                  fontSize: 14,
                  cursor: 'pointer',
                  fontFamily: 'SF Pro Text, system-ui, sans-serif',
                  letterSpacing: '-0.224px',
                }}
              >
                + Tambah Varian
              </button>
            </header>

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
                    {['Storage', 'Warna', 'Modifier (Rp)', 'Stok', 'SKU', ''].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-caption-strong text-ink-muted-48"
                          style={{
                            padding: '10px 8px',
                            textAlign: 'left',
                            fontWeight: 600,
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          type="text"
                          value={v.storage}
                          onChange={(e) =>
                            updateVariant(idx, 'storage', e.target.value)
                          }
                          style={{ ...inputStyle, padding: '8px 10px' }}
                          placeholder="256GB"
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          type="text"
                          value={v.color}
                          onChange={(e) =>
                            updateVariant(idx, 'color', e.target.value)
                          }
                          style={{ ...inputStyle, padding: '8px 10px' }}
                          placeholder="Natural Titanium"
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          type="number"
                          value={v.price_modifier}
                          onChange={(e) =>
                            updateVariant(idx, 'price_modifier', e.target.value)
                          }
                          style={{ ...inputStyle, padding: '8px 10px' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) =>
                            updateVariant(idx, 'stock', e.target.value)
                          }
                          style={{ ...inputStyle, padding: '8px 10px' }}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) =>
                            updateVariant(idx, 'sku', e.target.value)
                          }
                          style={{ ...inputStyle, padding: '8px 10px' }}
                          placeholder="SKU-001"
                        />
                      </td>
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          disabled={variants.length === 1}
                          aria-label="Hapus varian"
                          className="active-scale"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color:
                              variants.length === 1 ? '#cccccc' : '#b3261e',
                            cursor:
                              variants.length === 1 ? 'not-allowed' : 'pointer',
                            fontSize: 18,
                            padding: 4,
                          }}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

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
              padding: '14px 22px',
              fontSize: 17,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Menyimpan…' : 'Simpan Produk'}
          </button>
        </form>
      </div>
    </div>
  )
}
