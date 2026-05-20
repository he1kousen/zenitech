import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PRODUCT_IMAGES } from '../../lib/productImages'
import SafeImage from './SafeImage'

const SLIDES = [
  {
    id: 'iphone',
    eyebrow: 'iPhone 16 Pro Max',
    title: 'High-Quality Tech.\nCrafted for life.',
    subtitle: 'Belanja koleksi resmi iPhone, Mac, iPad, dan aksesoris Apple di Indonesia.',
    cta: { label: 'Shop Now', to: '/products' },
    bg: 'linear-gradient(135deg, #d6dcff 0%, #c5d0ff 50%, #b8c6ff 100%)',
    backdropText: 'BESTSELLER',
    image: PRODUCT_IMAGES['iphone-16-pro-max'],
    imageAlt: 'iPhone 16 Pro Max',
  },
  {
    id: 'mac',
    eyebrow: 'MacBook Pro M4',
    title: 'Tenaga Pro.\nDimana saja.',
    subtitle: 'Chip M4 Pro yang ultra-cepat, layar Liquid Retina XDR, dan baterai sepanjang hari.',
    cta: { label: 'Shop Now', to: '/products?category=mac' },
    bg: 'linear-gradient(135deg, #fce4d8 0%, #f9d6c2 50%, #f5c8ad 100%)',
    backdropText: 'PRO',
    image: PRODUCT_IMAGES['macbook-pro-m4-14'],
    imageAlt: 'MacBook Pro M4',
  },
  {
    id: 'ipad',
    eyebrow: 'iPad Pro M4',
    title: 'Tipis. Ringan.\nAjaib.',
    subtitle: 'iPad paling powerful dengan chip M4 dan layar Ultra Retina XDR.',
    cta: { label: 'Shop Now', to: '/products?category=ipad' },
    bg: 'linear-gradient(135deg, #d4e7f5 0%, #bcd8ee 50%, #a5cae8 100%)',
    backdropText: 'NEW',
    image: PRODUCT_IMAGES['ipad-pro-m4-11'],
    imageAlt: 'iPad Pro M4',
  },
]

const AUTO_MS = 6000

export default function HeroSlideshow() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(() => {
      setActive((v) => (v + 1) % SLIDES.length)
    }, AUTO_MS)
    return () => clearTimeout(timerRef.current)
  }, [active, paused])

  return (
    <section
      className="hero-slideshow"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="hero-slideshow__viewport">
        {SLIDES.map((s, i) => (
          <article
            key={s.id}
            className={`hero-slide ${i === active ? 'is-active' : ''}`}
            aria-hidden={i !== active}
            style={{ background: s.bg }}
          >
            <div className="hero-slide__backdrop" aria-hidden="true">
              {s.backdropText}
            </div>

            <div className="hero-slide__content">
              <div className="hero-slide__copy">
                <p className="hero-slide__eyebrow">{s.eyebrow}</p>
                <h1 className="hero-slide__title">{s.title}</h1>
                <p className="hero-slide__subtitle">{s.subtitle}</p>
                <Link to={s.cta.to} className="hero-slide__cta active-scale">
                  {s.cta.label}
                </Link>
              </div>

              <div className="hero-slide__media">
                <SafeImage
                  src={s.image}
                  fallbacks={[PRODUCT_IMAGES['iphone-16-pro-max']]}
                  alt={s.imageAlt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hero-slideshow__dots" role="tablist" aria-label="Hero slides">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Slide ${i + 1}`}
            className={`hero-dot ${i === active ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>

      <style>{`
        .hero-slideshow {
          position: relative;
          padding: 24px 24px 0;
        }
        .hero-slideshow__viewport {
          position: relative;
          width: 100%;
          height: clamp(440px, 62vw, 720px);
          border-radius: 18px;
          overflow: hidden;
        }
        .hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.7s ease;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero-slide.is-active { opacity: 1; }

        .hero-slide__backdrop {
          position: absolute;
          left: 50%;
          bottom: -3vw;
          transform: translateX(-50%);
          font-family: 'SF Pro Display', system-ui, -apple-system, sans-serif;
          font-size: clamp(96px, 18vw, 240px);
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 0.9;
          color: rgba(255, 255, 255, 0.55);
          pointer-events: none;
          white-space: nowrap;
          user-select: none;
        }

        .hero-slide__content {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: clamp(32px, 6vw, 80px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: center;
        }
        .hero-slide__copy {
          max-width: 540px;
        }
        .hero-slide__eyebrow {
          font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1d1d1f;
          margin-bottom: 16px;
        }
        .hero-slide__title {
          font-family: 'SF Pro Display', system-ui, -apple-system, sans-serif;
          font-size: clamp(32px, 5vw, 56px);
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.015em;
          color: #1d1d1f;
          margin-bottom: 16px;
          white-space: pre-line;
        }
        .hero-slide__subtitle {
          font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
          font-size: 17px;
          line-height: 1.47;
          letter-spacing: -0.022em;
          color: #1d1d1f;
          margin-bottom: 28px;
          max-width: 460px;
        }
        .hero-slide__cta {
          display: inline-block;
          background-color: #1d1d1f;
          color: #ffffff;
          font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 14px 28px;
          border-radius: 9999px;
          text-decoration: none;
        }

        .hero-slide__media {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-slide__media img {
          max-width: 92%;
          max-height: 92%;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 30px 50px rgba(0, 0, 0, 0.18));
        }

        .hero-slideshow__dots {
          position: absolute;
          left: clamp(36px, 6vw, 96px);
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 10px;
          z-index: 3;
        }
        .hero-dot {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          border: none;
          background-color: rgba(29, 29, 31, 0.25);
          cursor: pointer;
          padding: 0;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }
        .hero-dot.is-active {
          background-color: #1d1d1f;
          transform: scale(1.2);
        }

        @media (max-width: 834px) {
          .hero-slideshow { padding: 12px 12px 0; }
          .hero-slide__content {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 32px 24px;
            align-content: start;
          }
          .hero-slide__copy { text-align: center; margin: 0 auto; }
          .hero-slide__subtitle { margin-left: auto; margin-right: auto; }
          .hero-slide__media { height: 48%; }
          .hero-slideshow__dots {
            position: static;
            transform: none;
            flex-direction: row;
            justify-content: center;
            margin-top: 16px;
          }
        }
      `}</style>
    </section>
  )
}
