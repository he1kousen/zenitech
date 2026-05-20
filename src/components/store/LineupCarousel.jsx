import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import { getImageUrl } from '../../lib/supabase'

const formatRupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`

function CardSkeleton() {
  return (
    <div
      className="lineup-card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          backgroundColor: '#f0f0f0',
          borderRadius: 12,
          marginBottom: 24,
        }}
      />
      <div style={{ height: 14, width: '40%', backgroundColor: '#f0f0f0', borderRadius: 4, margin: '0 auto 12px' }} />
      <div style={{ height: 22, width: '70%', backgroundColor: '#f0f0f0', borderRadius: 4, margin: '0 auto 8px' }} />
      <div style={{ height: 14, width: '50%', backgroundColor: '#f0f0f0', borderRadius: 4, margin: '0 auto' }} />
    </div>
  )
}

function LineupCard({ product }) {
  const { name, slug, base_price, image_url, category } = product
  return (
    <article className="lineup-card">
      <Link
        to={`/products/${slug}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div className="lineup-card-image">
          {image_url ? (
            <img
              src={getImageUrl(image_url, 'medium')}
              alt={name}
              loading="lazy"
            />
          ) : (
            <div className="lineup-card-placeholder">
              <span>{name}</span>
            </div>
          )}
        </div>
      </Link>

      <div style={{ textAlign: 'center', padding: '0 8px' }}>
        {category && (
          <p
            style={{
              fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#86868b',
              marginBottom: 12,
            }}
          >
            {category}
          </p>
        )}
        <h3
          style={{
            fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
            fontSize: 24,
            fontWeight: 600,
            lineHeight: 1.16,
            letterSpacing: '0.009em',
            color: '#1d1d1f',
            marginBottom: 8,
          }}
        >
          {name}
        </h3>
        <p
          style={{
            fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
            fontSize: 14,
            lineHeight: 1.43,
            letterSpacing: '-0.016em',
            color: '#1d1d1f',
            marginBottom: 20,
          }}
        >
          Mulai dari {formatRupiah(base_price)}
        </p>

        <div
          style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to={`/products/${slug}`}
            className="active-scale"
            style={{
              backgroundColor: '#0066cc',
              color: '#ffffff',
              fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
              fontSize: 14,
              borderRadius: 9999,
              padding: '8px 16px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Beli
          </Link>
          <Link
            to={`/products/${slug}`}
            className="active-scale"
            style={{
              color: '#0066cc',
              fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Selengkapnya ›
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function LineupCarousel({ title = 'Jelajahi jajarannya.', linkLabel = 'Bandingkan semua model', linkTo = '/products' }) {
  const { products, loading, error } = useProducts({ pageSize: 8 })
  const scrollerRef = useRef(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const updateArrows = () => {
    const el = scrollerRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [products.length])

  const scrollByCard = (dir) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('.lineup-card')
    const step = card ? card.getBoundingClientRect().width + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <section
      style={{
        backgroundColor: '#f5f5f7',
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 24,
            padding: '0 22px',
            marginBottom: 40,
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 600,
              lineHeight: 1.08,
              letterSpacing: '-0.005em',
              color: '#1d1d1f',
              margin: 0,
            }}
          >
            {title}
          </h2>
          <Link
            to={linkTo}
            className="active-scale"
            style={{
              color: '#0066cc',
              fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
              fontSize: 17,
              textDecoration: 'none',
            }}
          >
            {linkLabel} ›
          </Link>
        </header>

        {error && (
          <p style={{ color: '#b00020', textAlign: 'center', padding: 24 }}>
            Gagal memuat produk. {error}
          </p>
        )}

        <div className="lineup-scroller-wrap">
          <div
            ref={scrollerRef}
            className="lineup-scroller"
          >
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={`s-${i}`} />
            ))}

            {!loading && !error && products.length === 0 && (
              <p style={{ color: '#86868b', padding: 24 }}>Belum ada produk.</p>
            )}

            {!loading && !error && products.map((p) => (
              <LineupCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '24px 22px 0',
          }}
        >
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={!canPrev}
            aria-label="Sebelumnya"
            className="lineup-arrow"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={!canNext}
            aria-label="Berikutnya"
            className="lineup-arrow"
          >
            ›
          </button>
        </div>
      </div>

      <style>{`
        .lineup-scroller-wrap {
          position: relative;
        }
        .lineup-scroller {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: minmax(300px, 360px);
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 0 22px 8px;
          scrollbar-width: none;
        }
        .lineup-scroller::-webkit-scrollbar { display: none; }
        .lineup-card {
          scroll-snap-align: start;
          background-color: #ffffff;
          border-radius: 18px;
          padding: 24px 24px 32px;
          display: flex;
          flex-direction: column;
        }
        .lineup-card-image {
          width: 100%;
          aspect-ratio: 1 / 1;
          background-color: #fafafc;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          overflow: hidden;
        }
        .lineup-card-image img {
          max-width: 78%;
          max-height: 78%;
          width: auto;
          height: auto;
          object-fit: contain;
          box-shadow: rgba(0, 0, 0, 0.22) 3px 5px 30px 0;
        }
        .lineup-card-placeholder {
          font-family: 'SF Pro Display', system-ui, -apple-system, sans-serif;
          font-size: 28px;
          font-weight: 600;
          color: #d2d2d7;
          letter-spacing: -0.01em;
          text-align: center;
          padding: 24px;
        }
        .lineup-arrow {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          background-color: rgba(210, 210, 215, 0.5);
          color: #1d1d1f;
          border: none;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.15s ease, transform 0.1s ease;
        }
        .lineup-arrow:hover:not(:disabled) {
          background-color: rgba(210, 210, 215, 0.85);
        }
        .lineup-arrow:active:not(:disabled) {
          transform: scale(0.95);
        }
        .lineup-arrow:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        @media (min-width: 1024px) {
          .lineup-scroller { grid-auto-columns: minmax(0, 1fr); grid-auto-flow: row; grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>
    </section>
  )
}
