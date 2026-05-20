import { Link } from 'react-router-dom'
import { PRODUCT_IMAGES } from '../../lib/productImages'
import SafeImage from './SafeImage'

const TILES = [
  {
    id: 'mac',
    label: 'Mac',
    href: '/products?category=mac',
    image: PRODUCT_IMAGES['macbook-air-m3-13'],
    span: 'wide',
  },
  {
    id: 'iphone',
    label: 'iPhone',
    href: '/products?category=iphone',
    image: PRODUCT_IMAGES['iphone-16-pro-max'],
    span: 'half',
  },
  {
    id: 'aksesoris',
    label: 'Aksesoris',
    href: '/products?category=aksesoris',
    image: PRODUCT_IMAGES['airpods-pro-2'],
    span: 'half',
  },
  {
    id: 'ipad',
    label: 'iPad',
    href: '/products?category=ipad',
    image: PRODUCT_IMAGES['ipad-pro-m4-11'],
    span: 'half',
  },
  {
    id: 'apple-watch',
    label: 'Apple Watch',
    href: '/products?category=apple-watch',
    image: PRODUCT_IMAGES['apple-watch-series-10'],
    span: 'half',
  },
]

export default function CategoryShowcase() {
  return (
    <section className="cat-showcase">
      <div className="cat-grid">
        {TILES.map((t) => (
          <Link
            to={t.href}
            key={t.id}
            className={`cat-tile cat-tile--${t.span}`}
          >
            <div className="cat-tile__copy">
              <h3 className="cat-tile__label">{t.label}</h3>
              <span className="cat-tile__link">Selengkapnya ›</span>
            </div>
            <div className="cat-tile__image">
              <SafeImage
                src={t.image}
                fallbacks={[PRODUCT_IMAGES['iphone-16-pro-max']]}
                alt={t.label}
                loading="lazy"
              />
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .cat-showcase {
          padding: 24px 24px 0;
          max-width: 1488px;
          margin: 0 auto;
        }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .cat-tile {
          position: relative;
          background-color: #f5f5f7;
          border-radius: 18px;
          overflow: hidden;
          min-height: 280px;
          padding: 32px;
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          gap: 16px;
          text-decoration: none;
          color: inherit;
          transition: background-color 0.2s ease;
        }
        .cat-tile:hover { background-color: #ededf0; }
        .cat-tile--wide { grid-column: 1 / -1; min-height: 360px; }

        .cat-tile__copy {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          z-index: 2;
        }
        .cat-tile__label {
          font-family: 'SF Pro Display', system-ui, -apple-system, sans-serif;
          font-size: clamp(20px, 2vw, 24px);
          font-weight: 700;
          line-height: 1.16;
          letter-spacing: 0.009em;
          color: #1d1d1f;
          margin: 0;
        }
        .cat-tile__link {
          font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
          font-size: 14px;
          color: #1d1d1f;
        }

        .cat-tile__image {
          position: absolute;
          right: 24px;
          top: 50%;
          transform: translateY(-50%);
          width: 60%;
          height: 80%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          pointer-events: none;
        }
        .cat-tile__image img {
          max-height: 100%;
          max-width: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
        }
        .cat-tile--wide .cat-tile__image {
          width: 65%;
          height: 85%;
        }

        @media (min-width: 1024px) {
          .cat-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .cat-tile--wide { grid-column: span 2; grid-row: span 2; }
          .cat-tile { min-height: 240px; }
          .cat-tile--wide { min-height: 496px; }
        }
        @media (max-width: 540px) {
          .cat-showcase { padding: 16px 12px 0; }
          .cat-grid { grid-template-columns: 1fr; gap: 12px; }
          .cat-tile, .cat-tile--wide { min-height: 220px; padding: 24px; }
          .cat-tile__image { width: 50%; right: 16px; }
        }
      `}</style>
    </section>
  )
}
