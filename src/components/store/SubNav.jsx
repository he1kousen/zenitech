import { Link, useLocation } from 'react-router-dom'

/**
 * SubNav - Frosted glass sub-nav strip ala Apple
 * Pakai di halaman storefront di bawah GlobalNav
 *
 * Props:
 * - title: string (kategori/section name di kiri, e.g. "Store", "iPhone")
 * - links: { label, to }[] (opsional, inline links di kanan)
 * - cta: { label, to } (opsional, primary CTA di paling kanan)
 */
export default function SubNav({ title, links = [], cta = null }) {
  const location = useLocation()
  const currentPath = `${location.pathname}${location.search}`

  return (
    <div
      className="sticky"
      style={{
        top: 44,
        zIndex: 40,
        backgroundColor: 'rgba(245, 245, 247, 0.72)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
      }}
    >
      <div
        className="flex items-center"
        style={{
          maxWidth: 1024,
          margin: '0 auto',
          padding: '0 22px',
          height: 52,
        }}
      >
        <Link
          to="/"
          className="active-scale text-ink"
          style={{
            fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
            fontSize: 21,
            fontWeight: 600,
            lineHeight: 1.19,
            letterSpacing: '0.011em',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          {title}
        </Link>

        <div style={{ flex: 1 }} />

        {/* Desktop links */}
        <nav className="hidden min-[834px]:flex items-center" style={{ gap: 0 }}>
          {links.map((link) => {
            const active = currentPath === link.to
            return (
              <Link
                key={link.label}
                to={link.to}
                className="active-scale"
                style={{
                  fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: '-0.12px',
                  color: '#1d1d1f',
                  padding: '4px 12px',
                  textDecoration: 'none',
                  opacity: active ? 1 : 0.78,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = active ? '1' : '0.78')}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {cta && (
          <Link
            to={cta.to}
            className="btn-primary active-scale"
            style={{
              marginLeft: 16,
              padding: '4px 11px',
              fontSize: 12,
              lineHeight: 1.4,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  )
}
