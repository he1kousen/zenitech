import { Link } from 'react-router-dom'
import { getImageUrl } from '../../lib/supabase'
import { resolveProductImage, ULTIMATE_FALLBACK } from '../../lib/productImages'
import SafeImage from './SafeImage'

const formatRupiah = (n) => `Rp${Number(n).toLocaleString('id-ID')}`

/**
 * ProductCard — gallery style
 * Mengikuti DESIGN.md: tidak ada border, tidak ada shadow di card.
 * Product shadow HANYA di image. Tile = parchment surface.
 */
export default function ProductCard({ id, name, slug, base_price, image_url, category, layout = 'tile' }) {
  const imageSrc = resolveProductImage({ slug, image_url, category })

  if (layout === 'flat') {
    return (
      <Link
        to={`/products/${slug}`}
        className="product-card-flat"
        data-product-id={id}
      >
        <div className="product-card-flat__image">
          <SafeImage
            src={getImageUrl(imageSrc, 'medium')}
            fallbacks={[ULTIMATE_FALLBACK]}
            alt={name}
            loading="lazy"
          />
        </div>
        <p className="product-card-flat__category">{category}</p>
        <h3 className="product-card-flat__name">{name}</h3>
        <p className="product-card-flat__price">{formatRupiah(base_price)}</p>
      </Link>
    )
  }

  return (
    <Link
      to={`/products/${slug}`}
      className="block product-card-link"
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
        transition: 'background-color 0.2s ease',
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
          marginBottom: 24,
        }}
      >
        Mulai dari {formatRupiah(base_price)}
      </p>

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
          className="product-shadow"
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
    </Link>
  )
}
