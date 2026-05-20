import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProduct'
import { usePageMeta } from '../hooks/usePageMeta'
import { useCartStore } from '../store/cartStore'
import VariantSelector from '../components/store/VariantSelector'
import SubNav from '../components/store/SubNav'
import { getImageUrl } from '../lib/supabase'
import { toast } from '../store/toastStore'

const formatRupiah = (n) => `Rp${Number(n || 0).toLocaleString('id-ID')}`

const SPECS_FALLBACK = [
  { label: 'Garansi', value: 'Resmi 1 tahun' },
  { label: 'Pengiriman', value: 'Gratis seluruh Indonesia' },
  { label: 'Cicilan', value: '0% hingga 12 bulan' },
  { label: 'Stok', value: 'Tersedia di gudang Jakarta' },
]

const CATEGORY_FALLBACK_IMAGE = {
  iphone: '/images/iphone.svg',
  mac: '/images/macbook.svg',
  ipad: '/images/ipad.svg',
  'apple-watch': '/images/watch.svg',
  watch: '/images/watch.svg',
  aksesoris: '/images/airpods.svg',
}

function StockInfo({ stock }) {
  if (stock == null) return null
  if (stock === 0) {
    return (
      <p
        style={{
          fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: '#b00020',
          letterSpacing: '-0.224px',
        }}
      >
        Stok habis
      </p>
    )
  }
  if (stock <= 10) {
    return (
      <p
        style={{
          fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: '#b25e09',
          letterSpacing: '-0.224px',
        }}
      >
        Stok terbatas — sisa {stock}
      </p>
    )
  }
  return (
    <p
      style={{
        fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
        fontSize: 14,
        fontWeight: 600,
        color: '#1a7f37',
        letterSpacing: '-0.224px',
      }}
    >
      Tersedia
    </p>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="pdp-layout" style={{ maxWidth: 1024, margin: '0 auto', padding: '40px 22px 80px' }}>
      <div className="animate-pulse pdp-gallery">
        <div
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            backgroundColor: '#e8e8ec',
            borderRadius: 18,
            marginBottom: 12,
          }}
        />
        <div className="flex" style={{ gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 60,
                height: 60,
                backgroundColor: '#e8e8ec',
                borderRadius: 11,
              }}
            />
          ))}
        </div>
      </div>
      <div className="animate-pulse pdp-info">
        <div style={{ height: 14, width: '20%', backgroundColor: '#e8e8ec', borderRadius: 4, marginBottom: 12 }} />
        <div style={{ height: 40, width: '80%', backgroundColor: '#e8e8ec', borderRadius: 4, marginBottom: 17 }} />
        <div style={{ height: 28, width: '50%', backgroundColor: '#e8e8ec', borderRadius: 4, marginBottom: 24 }} />
        <div style={{ height: 17, width: '90%', backgroundColor: '#e8e8ec', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 17, width: '70%', backgroundColor: '#e8e8ec', borderRadius: 4, marginBottom: 32 }} />
        <div style={{ height: 80, width: '100%', backgroundColor: '#e8e8ec', borderRadius: 12, marginBottom: 24 }} />
        <div style={{ height: 44, width: '100%', backgroundColor: '#e8e8ec', borderRadius: 9999 }} />
      </div>
    </div>
  )
}

function NotFound() {
  return (
    <main
      className="flex items-center justify-center"
      style={{ minHeight: 'calc(100vh - 96px)', padding: 24, backgroundColor: '#f5f5f7' }}
    >
      <div className="text-center" style={{ maxWidth: 480 }}>
        <p
          style={{
            fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
            fontSize: 56,
            fontWeight: 600,
            color: '#1d1d1f',
            marginBottom: 8,
            letterSpacing: '-0.005em',
          }}
        >
          404
        </p>
        <p
          style={{
            fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
            fontSize: 24,
            fontWeight: 600,
            color: '#1d1d1f',
            marginBottom: 17,
          }}
        >
          Produk tidak ditemukan
        </p>
        <p style={{ fontSize: 17, color: '#6e6e73', marginBottom: 32 }}>
          Produk yang kamu cari mungkin sudah tidak tersedia.
        </p>
        <Link to="/products" className="btn-primary active-scale" style={{ display: 'inline-block', textDecoration: 'none' }}>
          Lihat semua produk
        </Link>
      </div>
    </main>
  )
}

function resolveImages(product) {
  const images = product?.images || []
  if (images.length > 0) return images
  const slug = typeof product?.category?.slug === 'string'
    ? product.category.slug
    : null
  const fallback = CATEGORY_FALLBACK_IMAGE[slug] || '/images/iphone.svg'
  return [{ id: 'fallback', url: fallback }]
}

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { product, loading, error, notFound } = useProduct(slug)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  usePageMeta({
    title: product?.name ? `${product.name} — Zenitech` : 'Produk',
    description: product?.description
      ? product.description.slice(0, 160)
      : 'Detail produk Apple di Zenitech.',
  })

  const [selectedStorage, setSelectedStorage] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [adding, setAdding] = useState(false)
  const [addedFlash, setAddedFlash] = useState(false)
  const [showStickyBar, setShowStickyBar] = useState(false)

  const ctaRef = useRef(null)

  useEffect(() => {
    if (!product || !product.variants?.length) return
    const firstAvailable = product.variants.find((v) => (v.stock || 0) > 0) || product.variants[0]
    if (firstAvailable.storage && !selectedStorage) setSelectedStorage(firstAvailable.storage)
    if (firstAvailable.color && !selectedColor) setSelectedColor(firstAvailable.color)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  useEffect(() => {
    const node = ctaRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting)
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [product])

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null
    return (
      product.variants.find(
        (v) =>
          (selectedStorage ? v.storage === selectedStorage : !v.storage) &&
          (selectedColor ? v.color === selectedColor : !v.color)
      ) || null
    )
  }, [product, selectedStorage, selectedColor])

  const hasVariants = (product?.variants?.length || 0) > 0
  const variantSelected = !hasVariants || !!selectedVariant
  const stock = selectedVariant ? selectedVariant.stock : null
  const isOutOfStock = hasVariants && (stock === 0 || stock == null)

  const finalPrice = useMemo(() => {
    if (!product) return 0
    const modifier = selectedVariant?.price_modifier || 0
    return Number(product.base_price) + Number(modifier)
  }, [product, selectedVariant])

  const handleAddToCart = async () => {
    if (!product || !variantSelected || isOutOfStock) return
    setAdding(true)
    const variantToAdd = selectedVariant || {
      id: `${product.id}-default`,
      storage: null,
      color: null,
      price_modifier: 0,
      stock: 999,
    }
    addItem(product, variantToAdd, 1)
    setTimeout(() => {
      setAdding(false)
      setAddedFlash(true)
      openCart()
      toast.success(`${product.name} ditambahkan ke keranjang`)
      setTimeout(() => setAddedFlash(false), 1500)
    }, 200)
  }

  const handleBuyNow = () => {
    if (!product || !variantSelected || isOutOfStock) return
    const variantToAdd = selectedVariant || {
      id: `${product.id}-default`,
      storage: null,
      color: null,
      price_modifier: 0,
      stock: 999,
    }
    addItem(product, variantToAdd, 1)
    navigate('/checkout')
  }

  if (loading) {
    return (
      <>
        <SubNav title="Store" links={[]} />
        <main style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 96px)' }}>
          <ProductDetailSkeleton />
        </main>
      </>
    )
  }

  if (notFound) return <NotFound />

  if (error) {
    return (
      <main
        className="flex items-center justify-center"
        style={{ minHeight: 'calc(100vh - 96px)', padding: 24, backgroundColor: '#f5f5f7' }}
      >
        <div className="text-center">
          <p style={{ color: '#b00020', marginBottom: 17 }}>
            Gagal memuat produk. {error}
          </p>
          <Link to="/products" className="text-link">
            Kembali ke katalog
          </Link>
        </div>
      </main>
    )
  }

  if (!product) return null

  const images = resolveImages(product)
  const primaryImage = images[activeImageIdx] || images[0]
  const ctaDisabled = !variantSelected || isOutOfStock || adding

  const subNavCta = {
    label: addedFlash ? 'Ditambahkan' : 'Beli',
    to: '#cta',
  }

  return (
    <>
      <SubNav title={product.category?.name || 'Store'} cta={subNavCta} />

      <main style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 96px)' }}>
        {/* Headline section (parchment) */}
        <section
          style={{
            backgroundColor: '#f5f5f7',
            padding: '40px 22px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ maxWidth: 1024, margin: '0 auto' }}>
            {product.category?.slug && (
              <Link
                to={`/products?category=${product.category.slug}`}
                style={{
                  fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                  fontSize: 14,
                  color: '#0066cc',
                  letterSpacing: '-0.16px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  marginBottom: 8,
                }}
              >
                {product.category.name}
              </Link>
            )}

            <h1
              style={{
                fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 600,
                lineHeight: 1.07,
                letterSpacing: '-0.005em',
                color: '#1d1d1f',
                marginBottom: 8,
              }}
            >
              {product.name}
            </h1>

            {product.description && (
              <p
                style={{
                  fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
                  fontSize: 'clamp(17px, 2vw, 21px)',
                  fontWeight: 400,
                  color: '#1d1d1f',
                  letterSpacing: '0.011em',
                  lineHeight: 1.19,
                  maxWidth: 720,
                  margin: '0 auto',
                }}
              >
                {product.description.split('\n')[0]}
              </p>
            )}
          </div>
        </section>

        <div
          className="pdp-layout"
          style={{
            maxWidth: 1024,
            margin: '0 auto',
            padding: '40px 22px 80px',
          }}
        >
          {/* Gallery */}
          <section className="pdp-gallery">
            <div
              className="flex items-center justify-center"
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 18,
                backgroundColor: '#f5f5f7',
                overflow: 'hidden',
                marginBottom: 12,
                position: 'sticky',
                top: 110,
              }}
            >
              {primaryImage?.url ? (
                <img
                  src={getImageUrl(primaryImage.url, 'full')}
                  alt={product.name}
                  className="product-shadow"
                  style={{
                    maxWidth: '78%',
                    maxHeight: '78%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              ) : (
                <span style={{ color: '#a1a1a6' }}>Tidak ada gambar</span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex flex-wrap" style={{ gap: 8, justifyContent: 'center' }}>
                {images.map((img, idx) => {
                  const isActive = idx === activeImageIdx
                  return (
                    <button
                      key={img.id || idx}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      aria-label={`Lihat gambar ${idx + 1}`}
                      aria-pressed={isActive}
                      className="active-scale"
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 11,
                        border: `2px solid ${isActive ? '#0066cc' : '#d2d2d7'}`,
                        backgroundColor: '#ffffff',
                        padding: 6,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      <img
                        src={getImageUrl(img.url, 'thumb')}
                        alt=""
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* Info */}
          <section className="pdp-info">
            <p
              style={{
                fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                fontSize: 14,
                color: '#6e6e73',
                letterSpacing: '-0.16px',
                marginBottom: 8,
              }}
            >
              Konfigurasi & beli
            </p>

            <h2
              style={{
                fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
                fontSize: 28,
                fontWeight: 600,
                lineHeight: 1.14,
                color: '#1d1d1f',
                marginBottom: 8,
                letterSpacing: '0.007em',
              }}
            >
              Mulai dari {formatRupiah(finalPrice)}
            </h2>

            <p
              style={{
                fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                fontSize: 14,
                color: '#6e6e73',
                marginBottom: 32,
                letterSpacing: '-0.16px',
              }}
            >
              atau cicilan 0% mulai Rp{Math.round(finalPrice / 12).toLocaleString('id-ID')}/bulan selama 12 bulan
            </p>

            {/* Variants */}
            {hasVariants && (
              <div style={{ marginBottom: 32 }}>
                <VariantSelector
                  variants={product.variants}
                  selectedStorage={selectedStorage}
                  selectedColor={selectedColor}
                  onStorageChange={setSelectedStorage}
                  onColorChange={setSelectedColor}
                />
              </div>
            )}

            {/* Stock */}
            <div style={{ marginBottom: 24 }}>
              <StockInfo stock={selectedVariant ? stock : null} />
              {!selectedVariant && hasVariants && (
                <p style={{ fontSize: 14, color: '#6e6e73' }}>
                  Pilih varian untuk melihat ketersediaan stok.
                </p>
              )}
            </div>

            {/* CTA */}
            <div
              ref={ctaRef}
              id="cta"
              className="pdp-cta-row flex"
              style={{ gap: 12, marginBottom: 32, scrollMarginTop: 110 }}
            >
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={ctaDisabled}
                className="btn-primary active-scale pdp-cta-primary"
                style={{
                  flex: 1,
                  opacity: ctaDisabled ? 0.5 : 1,
                  cursor: ctaDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                {adding ? 'Menambahkan…' : addedFlash ? 'Ditambahkan ✓' : 'Tambah ke keranjang'}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={ctaDisabled}
                className="btn-secondary-pill active-scale pdp-cta-secondary"
                style={{
                  flex: 1,
                  opacity: ctaDisabled ? 0.5 : 1,
                  cursor: ctaDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                Beli langsung
              </button>
            </div>

            {/* Tabs */}
            <div>
              <div
                role="tablist"
                className="flex"
                style={{ borderBottom: '1px solid #d2d2d7', gap: 24 }}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'description'}
                  onClick={() => setActiveTab('description')}
                  style={{
                    padding: '12px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === 'description' ? '#0066cc' : 'transparent'}`,
                    color: activeTab === 'description' ? '#1d1d1f' : '#6e6e73',
                    fontSize: 17,
                    fontWeight: activeTab === 'description' ? 600 : 400,
                    cursor: 'pointer',
                    marginBottom: -1,
                    fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                    letterSpacing: '-0.022em',
                  }}
                >
                  Deskripsi
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'specs'}
                  onClick={() => setActiveTab('specs')}
                  style={{
                    padding: '12px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === 'specs' ? '#0066cc' : 'transparent'}`,
                    color: activeTab === 'specs' ? '#1d1d1f' : '#6e6e73',
                    fontSize: 17,
                    fontWeight: activeTab === 'specs' ? 600 : 400,
                    cursor: 'pointer',
                    marginBottom: -1,
                    fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                    letterSpacing: '-0.022em',
                  }}
                >
                  Spesifikasi
                </button>
              </div>

              <div style={{ paddingTop: 24 }}>
                {activeTab === 'description' && (
                  <div
                    style={{
                      fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                      fontSize: 17,
                      lineHeight: 1.47,
                      color: '#1d1d1f',
                      whiteSpace: 'pre-line',
                      letterSpacing: '-0.022em',
                    }}
                  >
                    {product.description || 'Belum ada deskripsi untuk produk ini.'}
                  </div>
                )}
                {activeTab === 'specs' && (
                  <dl style={{ fontSize: 17, color: '#1d1d1f' }}>
                    {SPECS_FALLBACK.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex"
                        style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}
                      >
                        <dt
                          style={{ width: '40%', flexShrink: 0, color: '#6e6e73' }}
                        >
                          {spec.label}
                        </dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                    {selectedVariant?.sku && (
                      <div className="flex" style={{ padding: '12px 0' }}>
                        <dt style={{ width: '40%', flexShrink: 0, color: '#6e6e73' }}>
                          SKU
                        </dt>
                        <dd>{selectedVariant.sku}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Floating sticky bar — frosted glass */}
        <div
          className="pdp-sticky-bar"
          aria-hidden={!showStickyBar}
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            height: 64,
            padding: '12px 22px',
            backgroundColor: 'rgba(245, 245, 247, 0.72)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            zIndex: 40,
            transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
            transition: 'transform 0.25s ease',
          }}
        >
          <div className="flex flex-col" style={{ minWidth: 0 }}>
            <span
              style={{
                fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                fontSize: 14,
                color: '#6e6e73',
                lineHeight: 1.2,
                letterSpacing: '-0.16px',
              }}
            >
              {product.name}
            </span>
            <span
              style={{
                fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                fontSize: 17,
                fontWeight: 600,
                color: '#1d1d1f',
                lineHeight: 1.2,
                letterSpacing: '-0.022em',
              }}
            >
              {formatRupiah(finalPrice)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={ctaDisabled}
            className="btn-primary active-scale"
            style={{
              flexShrink: 0,
              padding: '8px 16px',
              fontSize: 14,
              opacity: ctaDisabled ? 0.5 : 1,
              cursor: ctaDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {adding ? '…' : 'Beli'}
          </button>
        </div>

        <style>{`
          .pdp-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: start;
          }

          @media (max-width: 1024px) {
            .pdp-layout {
              grid-template-columns: 1fr;
              gap: 32px;
            }
          }

          .pdp-sticky-bar { display: none; }
          @media (max-width: 833px) {
            .pdp-sticky-bar { display: flex; }
            .pdp-cta-row { flex-direction: column; }
            .pdp-cta-primary, .pdp-cta-secondary { width: 100%; }
          }
        `}</style>
      </main>
    </>
  )
}
