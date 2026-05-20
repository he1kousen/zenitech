import { Link } from 'react-router-dom'

/**
 * ProductTile — full-bleed product tile ala Apple homepage
 *
 * Variants:
 * - light: white canvas (#ffffff)
 * - parchment: off-white (#f5f5f7)
 * - dark: near-black tile (#272729)
 * - dark-2: micro-step lighter dark (#2a2a2c)
 *
 * Layout:
 * - Centered stack: eyebrow → headline → tagline → 2 pill CTAs → product image
 * - No border-radius (full-bleed)
 * - Vertical padding: 80px (section)
 * - Product image carries the only shadow
 */

const VARIANT_STYLES = {
  light: { bg: '#ffffff', text: '#1d1d1f', muted: '#6e6e73', linkColor: '#0066cc' },
  parchment: { bg: '#f5f5f7', text: '#1d1d1f', muted: '#6e6e73', linkColor: '#0066cc' },
  dark: { bg: '#1d1d1f', text: '#f5f5f7', muted: '#a1a1a6', linkColor: '#2997ff' },
  'dark-2': { bg: '#2a2a2c', text: '#f5f5f7', muted: '#a1a1a6', linkColor: '#2997ff' },
}

function PrimaryPillCTA({ to, children, onDark = false }) {
  if (onDark) {
    return (
      <Link
        to={to}
        className="active-scale"
        style={{
          backgroundColor: '#2997ff',
          color: '#ffffff',
          fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
          fontSize: 17,
          fontWeight: 400,
          letterSpacing: '-0.022em',
          borderRadius: 9999,
          padding: '8px 16px',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        {children}
      </Link>
    )
  }
  return (
    <Link
      to={to}
      className="active-scale"
      style={{
        backgroundColor: '#0066cc',
        color: '#ffffff',
        fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
        fontSize: 17,
        fontWeight: 400,
        letterSpacing: '-0.022em',
        borderRadius: 9999,
        padding: '8px 16px',
        textDecoration: 'none',
        display: 'inline-block',
      }}
    >
      {children}
    </Link>
  )
}

function GhostPillCTA({ to, children, onDark = false }) {
  const color = onDark ? '#2997ff' : '#0066cc'
  return (
    <Link
      to={to}
      className="active-scale"
      style={{
        backgroundColor: 'transparent',
        color,
        fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
        fontSize: 17,
        fontWeight: 400,
        letterSpacing: '-0.022em',
        borderRadius: 9999,
        padding: '8px 16px',
        border: `1px solid ${color}`,
        textDecoration: 'none',
        display: 'inline-block',
      }}
    >
      {children}
    </Link>
  )
}

export default function ProductTile({
  variant = 'light',
  eyebrow,
  headline,
  tagline,
  primaryCTA,
  secondaryCTA,
  imageSrc,
  imageAlt,
  imageMaxWidth = 600,
  hasShadow = true,
  imagePosition = 'bottom',
  compact = false,
}) {
  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.light
  const isDark = variant === 'dark' || variant === 'dark-2'

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        paddingTop: compact ? 48 : 80,
        paddingBottom: 0,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        className="flex flex-col items-center text-center"
        style={{ padding: '0 22px' }}
      >
        {eyebrow && (
          <p
            style={{
              fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
              fontSize: 21,
              fontWeight: 600,
              lineHeight: 1.19,
              letterSpacing: '0.011em',
              color: style.text,
              marginBottom: 6,
            }}
          >
            {eyebrow}
          </p>
        )}

        {headline && (
          <h2
            style={{
              fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
              fontSize: 'clamp(32px, 6vw, 56px)',
              fontWeight: 600,
              lineHeight: 1.07,
              letterSpacing: '-0.005em',
              color: style.text,
              marginBottom: 8,
              maxWidth: 880,
            }}
          >
            {headline}
          </h2>
        )}

        {tagline && (
          <p
            style={{
              fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
              fontSize: 'clamp(19px, 2.4vw, 28px)',
              fontWeight: 400,
              lineHeight: 1.14,
              letterSpacing: '0.007em',
              color: style.text,
              marginBottom: 18,
              maxWidth: 720,
            }}
          >
            {tagline}
          </p>
        )}

        {(primaryCTA || secondaryCTA) && (
          <div
            className="flex flex-wrap items-center justify-center"
            style={{ gap: 14, marginBottom: compact ? 20 : 32 }}
          >
            {primaryCTA && (
              <PrimaryPillCTA to={primaryCTA.to} onDark={isDark}>
                {primaryCTA.label}
              </PrimaryPillCTA>
            )}
            {secondaryCTA && (
              <GhostPillCTA to={secondaryCTA.to} onDark={isDark}>
                {secondaryCTA.label}
              </GhostPillCTA>
            )}
          </div>
        )}

        {imageSrc && (
          <div
            style={{
              width: '100%',
              maxWidth: imageMaxWidth,
              padding: imagePosition === 'bottom' ? '0 0 0 0' : '0',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src={imageSrc}
              alt={imageAlt || ''}
              loading="lazy"
              className={hasShadow ? 'product-shadow' : ''}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                marginBottom: 0,
              }}
            />
          </div>
        )}
      </div>
    </section>
  )
}
