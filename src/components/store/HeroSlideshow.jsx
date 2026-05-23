import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PRODUCT_IMAGES } from '../../lib/productImages'
import SafeImage from './SafeImage'
import AnimatedText from '../ui/AnimatedText'
import AnimatedButton from '../ui/AnimatedButton'

const SLIDES = [
  {
    id: 'iphone',
    eyebrow: 'iPhone 15 Pro Max',
    title: 'Titanium.\nKuat. Ringan. Pro.',
    subtitle: 'Chip A17 Pro yang revolusioner. Kamera kelas pro. Desain titanium aerospace.',
    cta: { label: 'Shop Now', to: '/products' },
    bg: '#ffffff',
    backdropText: 'BESTSELLER',
    image: PRODUCT_IMAGES['iphone-15-pro-max'],
    imageAlt: 'iPhone 15 Pro Max',
  },
  {
    id: 'mac',
    eyebrow: 'MacBook Air M2',
    title: 'Ringan.\nNamun bertenaga.',
    subtitle: 'MacBook Air tertipis di dunia dengan chip M2 yang super cepat.',
    cta: { label: 'Shop Now', to: '/products?category=mac' },
    bg: '#ffffff',
    backdropText: 'M2',
    image: PRODUCT_IMAGES['macbook-air-m2'],
    imageAlt: 'MacBook Air M2',
  },
  {
    id: 'watch',
    eyebrow: 'Apple Watch Nike S3',
    title: 'Partner\nOlahraga Anda.',
    subtitle: 'Pantau aktivitas. Ukur olahraga. Didesain untuk pelari.',
    cta: { label: 'Shop Now', to: '/products?category=apple-watch' },
    bg: '#ffffff',
    backdropText: 'NIKE',
    image: PRODUCT_IMAGES['apple-watch-nike-s3'],
    imageAlt: 'Apple Watch Nike Series 3',
  },
]

const AUTO_MS = 5000

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
              <AnimatePresence mode="wait">
                {i === active && (
                  <motion.div
                    key={`copy-${s.id}`}
                    className="hero-slide__copy"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                      visible: { transition: { staggerChildren: 0.1 } },
                      hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                    }}
                  >
                    <motion.p
                      className="hero-slide__eyebrow"
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    >
                      {s.eyebrow}
                    </motion.p>
                    <h1 className="hero-slide__title">
                      <AnimatedText animation="splitWords" delay={0.1}>{s.title}</AnimatedText>
                    </h1>
                    <motion.p
                      className="hero-slide__subtitle"
                      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    >
                      {s.subtitle}
                    </motion.p>
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                      <AnimatedButton as={Link} to={s.cta.to} className="hero-slide__cta">
                        {s.cta.label}
                      </AnimatedButton>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {i === active && (
                  <motion.div
                    className="hero-slide__media"
                    key={`img-${s.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <SafeImage
                      src={s.image}
                      fallbacks={[PRODUCT_IMAGES['iphone-16-pro-max']]}
                      alt={s.imageAlt}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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
          color: rgba(0, 0, 0, 0.04);
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
          mix-blend-mode: multiply;
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
          .hero-slideshow__viewport { height: 640px; }
          .hero-slide__content {
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 32px 24px;
            align-content: start;
          }
          .hero-slide__copy { text-align: center; margin: 0 auto; }
          .hero-slide__subtitle { margin-left: auto; margin-right: auto; }
          .hero-slide__media { height: 45%; }
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
