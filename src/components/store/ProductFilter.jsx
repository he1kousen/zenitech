import { useEffect, useState } from 'react'
import { useCategories } from '../../hooks/useCategories'

const formatRupiah = (n) => {
  if (n === '' || n == null) return ''
  return Number(n).toLocaleString('id-ID')
}

const parseRupiah = (s) => {
  if (s === '' || s == null) return ''
  const digits = String(s).replace(/\D/g, '')
  return digits === '' ? '' : Number(digits)
}

function CategoryRadio({ value, checked, label, onChange }) {
  return (
    <label
      className="flex items-center cursor-pointer active-scale"
      style={{ padding: '8px 0', gap: 12 }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: 9999,
          border: `2px solid ${checked ? '#0066cc' : '#cccccc'}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'border-color 0.15s ease',
        }}
      >
        {checked && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 9999,
              backgroundColor: '#0066cc',
            }}
          />
        )}
      </span>
      <input
        type="radio"
        name="product-category"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
      />
      <span className="text-body-base text-ink">{label}</span>
    </label>
  )
}

export default function ProductFilter({
  categorySlug,
  minPrice,
  maxPrice,
  onCategoryChange,
  onPriceApply,
  onReset,
}) {
  const { categories, loading } = useCategories()

  const [localMin, setLocalMin] = useState(minPrice ?? '')
  const [localMax, setLocalMax] = useState(maxPrice ?? '')

  useEffect(() => {
    setLocalMin(minPrice ?? '')
  }, [minPrice])

  useEffect(() => {
    setLocalMax(maxPrice ?? '')
  }, [maxPrice])

  const handleApply = () => {
    onPriceApply?.({
      min: localMin === '' ? null : Number(localMin),
      max: localMax === '' ? null : Number(localMax),
    })
  }

  const handleReset = () => {
    setLocalMin('')
    setLocalMax('')
    onReset?.()
  }

  const currentCategory = categorySlug || 'all'

  return (
    <aside
      className="w-full"
      aria-label="Filter produk"
    >
      {/* Filter Kategori */}
      <section style={{ marginBottom: 32 }}>
        <h3 className="text-body-strong text-ink" style={{ marginBottom: 12 }}>
          Kategori
        </h3>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  height: 24,
                  backgroundColor: '#f0f0f0',
                  borderRadius: 4,
                  marginBottom: 8,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            <CategoryRadio
              value="all"
              label="Semua"
              checked={currentCategory === 'all'}
              onChange={onCategoryChange}
            />
            {categories.map((cat) => (
              <CategoryRadio
                key={cat.id}
                value={cat.slug}
                label={cat.name}
                checked={currentCategory === cat.slug}
                onChange={onCategoryChange}
              />
            ))}
          </div>
        )}
      </section>

      <div style={{ borderTop: '1px solid #e0e0e0', marginBottom: 24 }} />

      {/* Filter Harga */}
      <section style={{ marginBottom: 32 }}>
        <h3 className="text-body-strong text-ink" style={{ marginBottom: 12 }}>
          Harga
        </h3>

        <div className="flex flex-col" style={{ gap: 12 }}>
          <label className="flex flex-col" style={{ gap: 4 }}>
            <span className="text-caption text-ink-muted-80">Harga minimum</span>
            <div className="relative">
              <span
                className="text-body-base text-ink-muted-48 absolute"
                style={{
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatRupiah(localMin)}
                onChange={(e) => setLocalMin(parseRupiah(e.target.value))}
                placeholder="0"
                className="text-body-base text-ink w-full"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: '10px 12px 10px 40px',
                  height: 40,
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#0066cc')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
              />
            </div>
          </label>

          <label className="flex flex-col" style={{ gap: 4 }}>
            <span className="text-caption text-ink-muted-80">Harga maksimum</span>
            <div className="relative">
              <span
                className="text-body-base text-ink-muted-48 absolute"
                style={{
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              >
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={formatRupiah(localMax)}
                onChange={(e) => setLocalMax(parseRupiah(e.target.value))}
                placeholder="Tanpa batas"
                className="text-body-base text-ink w-full"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: 8,
                  padding: '10px 12px 10px 40px',
                  height: 40,
                  outline: 'none',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#0066cc')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#e0e0e0')}
              />
            </div>
          </label>

          <button
            type="button"
            onClick={handleApply}
            className="btn-dark-utility active-scale"
            style={{ width: '100%', marginTop: 4 }}
          >
            Terapkan
          </button>
        </div>
      </section>

      <div style={{ borderTop: '1px solid #e0e0e0', marginBottom: 24 }} />

      {/* Reset */}
      <button
        type="button"
        onClick={handleReset}
        className="text-link text-body-base active-scale"
        style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        Reset Filter
      </button>
    </aside>
  )
}
