import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { usePageMeta } from '../hooks/usePageMeta'
import ProductCard from '../components/store/ProductCard'
import ProductFilter from '../components/store/ProductFilter'
import SearchBar from '../components/store/SearchBar'
import SubNav from '../components/store/SubNav'

const PAGE_SIZE = 12

function ProductCardSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: '32px 24px 40px',
      }}
    >
      <div style={{ width: '40%', height: 14, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 8, marginInline: 'auto' }} />
      <div style={{ width: '60%', height: 24, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 8, marginInline: 'auto' }} />
      <div style={{ width: '50%', height: 14, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 24, marginInline: 'auto' }} />
      <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: '#f0f0f0', borderRadius: 8 }} />
    </div>
  )
}

function EmptyState({ onReset }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{ padding: '120px 24px' }}
    >
      <svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
        style={{ marginBottom: 24, color: '#d2d2d7' }}
      >
        <circle cx="34" cy="34" r="22" stroke="currentColor" strokeWidth="2" />
        <path d="m51 51 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M26 30h16M26 38h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p
        className="text-ink"
        style={{
          fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
          fontSize: 28,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        Produk tidak ditemukan
      </p>
      <p className="text-body-base" style={{ color: '#6e6e73', marginBottom: 17 }}>
        Coba ubah filter atau kata kunci pencarian.
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary-pill active-scale"
        >
          Reset filter
        </button>
      )}
    </div>
  )
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 6h18M6 12h12M10 18h4" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6 6 18 18M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pageNumbers = []
  const maxVisible = 5
  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  for (let i = start; i <= end; i++) pageNumbers.push(i)

  const btnBase = {
    minWidth: 40,
    height: 40,
    padding: '0 12px',
    borderRadius: 9999,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
    fontSize: 14,
  }

  return (
    <nav
      className="flex items-center justify-center"
      style={{ gap: 4, marginTop: 48 }}
      aria-label="Navigasi halaman"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="active-scale"
        style={{
          ...btnBase,
          color: page <= 1 ? '#a1a1a6' : '#0066cc',
          opacity: page <= 1 ? 0.5 : 1,
        }}
      >
        Sebelumnya
      </button>

      {pageNumbers.map((n) => {
        const active = n === page
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-current={active ? 'page' : undefined}
            className="active-scale"
            style={{
              ...btnBase,
              color: active ? '#ffffff' : '#1d1d1f',
              backgroundColor: active ? '#0066cc' : 'transparent',
              fontWeight: active ? 600 : 400,
            }}
          >
            {n}
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="active-scale"
        style={{
          ...btnBase,
          color: page >= totalPages ? '#a1a1a6' : '#0066cc',
          opacity: page >= totalPages ? 0.5 : 1,
        }}
      >
        Berikutnya
      </button>
    </nav>
  )
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories } = useCategories()

  const categorySlug = searchParams.get('category') || ''
  const minParam = searchParams.get('min')
  const maxParam = searchParams.get('max')
  const searchParam = searchParams.get('q') || ''
  const pageParam = parseInt(searchParams.get('page') || '1', 10) || 1

  const minPrice = minParam ? Number(minParam) : null
  const maxPrice = maxParam ? Number(maxParam) : null

  const activeCategoryName = useMemo(() => {
    if (!categorySlug) return null
    const found = categories.find((c) => c.slug === categorySlug)
    return found?.name || null
  }, [categories, categorySlug])

  usePageMeta({
    title: activeCategoryName
      ? `${activeCategoryName} — Zenitech`
      : 'Katalog Produk',
    description: activeCategoryName
      ? `Beli ${activeCategoryName} resmi di Zenitech. Stok asli, garansi resmi, pengiriman ke seluruh Indonesia.`
      : 'Katalog lengkap produk Apple di Zenitech: iPhone, Mac, iPad, Apple Watch, dan aksesoris.',
  })

  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const { products, total, loading, error } = useProducts({
    categorySlug: categorySlug || null,
    minPrice,
    maxPrice,
    search: searchParam,
    page: pageParam,
    pageSize: PAGE_SIZE,
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const subNavTitle = useMemo(() => {
    if (!categorySlug) return 'Store'
    const cat = categories.find((c) => c.slug === categorySlug)
    return cat?.name || 'Store'
  }, [categorySlug, categories])

  const subNavLinks = useMemo(() => {
    if (!categories.length) return []
    return [
      { label: 'Semua', to: '/products' },
      ...categories.map((c) => ({ label: c.name, to: `/products?category=${c.slug}` })),
    ]
  }, [categories])

  const updateParams = (updater) => {
    const next = new URLSearchParams(searchParams)
    updater(next)
    if (next.get('page') === '1') next.delete('page')
    setSearchParams(next, { replace: false })
  }

  const handleCategoryChange = (slug) => {
    updateParams((p) => {
      if (!slug || slug === 'all') p.delete('category')
      else p.set('category', slug)
      p.delete('page')
    })
    setDrawerOpen(false)
  }

  const handlePriceApply = ({ min, max }) => {
    updateParams((p) => {
      if (min == null || min === '') p.delete('min')
      else p.set('min', String(min))
      if (max == null || max === '') p.delete('max')
      else p.set('max', String(max))
      p.delete('page')
    })
    setDrawerOpen(false)
  }

  const handleReset = () => {
    setSearchParams(new URLSearchParams(), { replace: false })
    setDrawerOpen(false)
  }

  const handleSearchChange = (value) => {
    updateParams((p) => {
      const trimmed = (value || '').trim()
      if (!trimmed) p.delete('q')
      else p.set('q', trimmed)
      p.delete('page')
    })
  }

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return
    updateParams((p) => {
      if (newPage === 1) p.delete('page')
      else p.set('page', String(newPage))
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <SubNav title={subNavTitle} links={subNavLinks} />

      <main style={{ backgroundColor: '#f5f5f7', minHeight: '100vh' }}>
        {/* Headline section */}
        <section style={{ padding: '64px 22px 32px' }}>
          <div style={{ maxWidth: 1024, margin: '0 auto' }}>
            <h1
              className="text-ink"
              style={{
                fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 600,
                lineHeight: 1.07,
                letterSpacing: '-0.005em',
                marginBottom: 8,
              }}
            >
              Bersedia, siap, beli.
            </h1>
            <p
              style={{
                fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
                fontSize: 'clamp(19px, 2.4vw, 24px)',
                fontWeight: 400,
                color: '#1d1d1f',
                letterSpacing: '0.007em',
                lineHeight: 1.16,
              }}
            >
              Pilih produk Apple favoritmu. Pengiriman gratis ke seluruh Indonesia.
            </p>
          </div>
        </section>

        {/* Body */}
        <section style={{ paddingBottom: 80 }}>
          <div
            className="catalog-layout"
            style={{
              maxWidth: 1024,
              margin: '0 auto',
              padding: '0 22px',
            }}
          >
            <aside className="catalog-sidebar">
              <ProductFilter
                categorySlug={categorySlug}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onCategoryChange={handleCategoryChange}
                onPriceApply={handlePriceApply}
                onReset={handleReset}
              />
            </aside>

            <div className="catalog-main">
              <div
                className="flex items-center catalog-toolbar"
                style={{ gap: 12, marginBottom: 24 }}
              >
                <SearchBar value={searchParam} onChange={handleSearchChange} />

                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="btn-dark-utility active-scale catalog-filter-toggle"
                  style={{ display: 'none', alignItems: 'center', gap: 8 }}
                  aria-label="Buka filter"
                >
                  <FilterIcon />
                  <span>Filter</span>
                </button>
              </div>

              {!loading && !error && (
                <p
                  style={{
                    fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                    fontSize: 14,
                    color: '#6e6e73',
                    marginBottom: 17,
                  }}
                >
                  {total} produk
                </p>
              )}

              {error && (
                <div
                  style={{
                    color: '#b00020',
                    padding: 24,
                    backgroundColor: '#ffffff',
                    borderRadius: 18,
                  }}
                >
                  Gagal memuat produk. {error}
                </div>
              )}

              {loading && !error && (
                <div className="catalog-grid">
                  {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              )}

              {!loading && !error && products.length === 0 && (
                <EmptyState onReset={() => setSearchParams({})} />
              )}

              {!loading && !error && products.length > 0 && (
                <>
                  <div className="catalog-grid">
                    {products.map((p) => (
                      <ProductCard key={p.id} {...p} />
                    ))}
                  </div>
                  <Pagination
                    page={pageParam}
                    totalPages={totalPages}
                    onChange={handlePageChange}
                  />
                </>
              )}
            </div>
          </div>
        </section>

        {drawerOpen && (
          <div
            className="fixed inset-0 catalog-drawer"
            style={{ zIndex: 70 }}
            onClick={() => setDrawerOpen(false)}
          >
            <div
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            />
            <div
              className="absolute"
              style={{
                left: 0,
                right: 0,
                bottom: 0,
                maxHeight: '85vh',
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                overflowY: 'auto',
                padding: 24,
                backgroundColor: '#ffffff',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: 24 }}
              >
                <h2
                  className="text-ink"
                  style={{
                    fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
                    fontSize: 24,
                    fontWeight: 600,
                  }}
                >
                  Filter
                </h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Tutup filter"
                  className="active-scale flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: 'transparent',
                    border: 'none',
                    color: '#1d1d1f',
                    cursor: 'pointer',
                  }}
                >
                  <CloseIcon />
                </button>
              </div>
              <ProductFilter
                categorySlug={categorySlug}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onCategoryChange={handleCategoryChange}
                onPriceApply={handlePriceApply}
                onReset={handleReset}
              />
            </div>
          </div>
        )}

        <style>{`
          .catalog-layout {
            display: grid;
            grid-template-columns: 240px 1fr;
            gap: 48px;
            align-items: start;
          }
          .catalog-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          @media (max-width: 1068px) {
            .catalog-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 833px) {
            .catalog-layout { grid-template-columns: 1fr; gap: 24px; }
            .catalog-sidebar { display: none; }
            .catalog-filter-toggle { display: inline-flex !important; }
          }
          @media (max-width: 540px) {
            .catalog-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </main>
    </>
  )
}
