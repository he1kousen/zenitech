import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { useProducts } from '../../hooks/useProducts'
import ProductCard from './ProductCard'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'

function FlatSkeleton() {
  return (
    <div className="bestseller-skeleton">
      <div className="bestseller-skeleton__image" />
      <div className="bestseller-skeleton__line" style={{ width: '30%' }} />
      <div className="bestseller-skeleton__line" style={{ width: '70%', height: 18 }} />
      <div className="bestseller-skeleton__line" style={{ width: '40%' }} />
    </div>
  )
}

export default function Bestsellers({ title = 'Bestsellers', linkLabel = 'See all products', linkTo = '/products', limit = 8 }) {
  const { products, loading, error } = useProducts({ pageSize: limit })
  const headerRef = useRef(null)

  useScrollAnimation(headerRef, { y: 30, duration: 0.6 })

  return (
    <section className="bestsellers">
      <div className="bestsellers__inner">
        <header className="bestsellers__header" ref={headerRef} style={{ opacity: 0 }}>
          <h2 className="bestsellers__title">{title}</h2>
          <Link to={linkTo} className="bestsellers__more active-scale">
            {linkLabel} →
          </Link>
        </header>

        {error && (
          <p style={{ color: '#b00020', textAlign: 'center', padding: 24 }}>
            Gagal memuat produk. {error}
          </p>
        )}

        <div className="bestsellers__grid">
          {loading && Array.from({ length: 4 }).map((_, i) => <FlatSkeleton key={`bs-${i}`} />)}

          {!loading && !error && products.length === 0 && (
            <p style={{ color: '#86868b', gridColumn: '1 / -1', padding: 24 }}>Belum ada produk.</p>
          )}

          {!loading && !error && products.map((p) => (
            <ProductCard key={p.id} {...p} layout="flat" />
          ))}
        </div>
      </div>

      <style>{`
        .bestsellers {
          padding: 80px 24px;
          background-color: #ffffff;
        }
        .bestsellers__inner {
          max-width: 1488px;
          margin: 0 auto;
        }
        .bestsellers__header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .bestsellers__title {
          font-family: 'SF Pro Display', system-ui, -apple-system, sans-serif;
          font-size: clamp(28px, 3.6vw, 36px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.005em;
          color: #1d1d1f;
          margin: 0;
        }
        .bestsellers__more {
          color: #1d1d1f;
          font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
          font-size: 15px;
          text-decoration: none;
        }
        .bestsellers__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        @media (max-width: 1024px) {
          .bestsellers__grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 540px) {
          .bestsellers { padding: 56px 16px; }
          .bestsellers__grid { grid-template-columns: 1fr; }
        }

        /* Flat product card (matches the visual ref: image tile + meta below) */
        .product-card-flat {
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }
        .product-card-flat__image {
          background-color: #ffffff;
          border-radius: 14px;
          aspect-ratio: 1 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          overflow: hidden;
          transition: background-color 0.2s ease;
        }
        .product-card-flat:hover .product-card-flat__image {
          background-color: #ededf0;
        }
        .product-card-flat__image img {
          max-width: 80%;
          max-height: 80%;
          width: auto;
          height: auto;
          object-fit: contain;
          mix-blend-mode: multiply;
        }
        .product-card-flat__category {
          font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #c47e10;
          margin: 8px 0 0 4px;
        }
        .product-card-flat__name {
          font-family: 'SF Pro Display', system-ui, -apple-system, sans-serif;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.2;
          letter-spacing: -0.01em;
          color: #1d1d1f;
          margin: 0 0 0 4px;
        }
        .product-card-flat__price {
          font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
          font-size: 14px;
          color: #1d1d1f;
          margin: 0 0 0 4px;
        }

        .bestseller-skeleton {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bestseller-skeleton__image {
          background-color: #f0f0f0;
          border-radius: 14px;
          aspect-ratio: 1 / 1;
        }
        .bestseller-skeleton__line {
          height: 14px;
          background-color: #f0f0f0;
          border-radius: 4px;
          margin-left: 4px;
        }
      `}</style>
    </section>
  )
}
