import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getImageUrl } from '../../lib/supabase'
import { resolveProductImage, ULTIMATE_FALLBACK } from '../../lib/productImages'
import SafeImage from './SafeImage'

const formatRupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`
const MotionLink = motion(Link)

/**
 * ProductCard — gallery style
 * Mengikuti DESIGN.md: tidak ada border, tidak ada shadow di card.
 * Product shadow HANYA di image. Tile = parchment surface.
 */
export default function ProductCard({ id, name, slug, base_price, image_url, category, layout = 'tile' }) {
  const imageSrc = resolveProductImage({ slug, image_url, category })
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (layout === 'flat') {
    return (
      <MotionLink
        to={`/products/${slug}`}
        className="product-card-flat group"
        data-product-id={id}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="product-card-flat__image overflow-hidden">
          <SafeImage
            src={getImageUrl(imageSrc, 'medium')}
            fallbacks={[ULTIMATE_FALLBACK]}
            alt={name}
            loading="lazy"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <p className="product-card-flat__category">{category}</p>
        <h3 className="product-card-flat__name">{name}</h3>
        <p className="product-card-flat__price">{formatRupiah(base_price)}</p>
      </MotionLink>
    )
  }

  return (
    <MotionLink
      to={`/products/${slug}`}
      className="block product-card-link relative group"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? false : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={prefersReducedMotion ? {} : { y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '32px 24px 40px',
        backgroundColor: '#ffffff',
        borderRadius: 18,
      }}
      data-product-id={id}
    >
      {category && (
        <p
          className="text-caption"
          style={{
            color: '#0066cc',
            fontWeight: 600,
            marginBottom: 8,
            letterSpacing: '-0.224px',
          }}
        >
          {category}
        </p>
      )}

      <h3
        className="text-ink"
        style={{
          fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
          fontSize: 24,
          fontWeight: 600,
          lineHeight: 1.16,
          letterSpacing: '0.009em',
          marginBottom: 4,
        }}
      >
        {name}
      </h3>

      <p
        className="text-ink-muted-80"
        style={{
          fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
          fontSize: 14,
          lineHeight: 1.43,
          letterSpacing: '-0.16px',
          marginBottom: 16,
        }}
      >
        Mulai dari {formatRupiah(base_price)}
      </p>

      <div 
        className="text-[#0066cc] font-medium text-sm mb-4 inline-flex items-center gap-1 relative overflow-hidden"
      >
        <span className="relative">
          Beli <span aria-hidden="true">&rsaquo;</span>
          <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#0066cc] transform origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
        </span>
      </div>

      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          marginTop: 'auto',
          padding: 16,
        }}
      >
        <SafeImage
          src={getImageUrl(imageSrc, 'medium')}
          fallbacks={[ULTIMATE_FALLBACK]}
          alt={name}
          loading="lazy"
          className="product-shadow transition-transform duration-500 ease-out group-hover:scale-105"
          style={{
            maxWidth: '85%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    </MotionLink>
  )
}
