import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'
import { useCartStore } from '../../store/cartStore'

const NAV_LINKS = [
  { label: 'Store', to: '/products' },
  { label: 'iPhone', to: '/products?category=iphone' },
  { label: 'Mac', to: '/products?category=mac' },
  { label: 'iPad', to: '/products?category=ipad' },
  { label: 'Watch', to: '/products?category=apple-watch' },
  { label: 'AirPods', to: '/products?category=aksesoris' },
]

function SearchIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

function BagIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M5 8h14l-1.2 11.2A2 2 0 0 1 15.8 21H8.2a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" strokeLinecap="round" />
    </svg>
  )
}

function HamburgerIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <path d="M6 6 18 18M18 6 6 18" strokeLinecap="round" />
    </svg>
  )
}

function AppleLogo({ size = 16, color = '#ffffff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M17.05 12.04c-.03-2.52 2.06-3.74 2.15-3.79-1.17-1.71-3-1.95-3.65-1.97-1.55-.16-3.03.92-3.82.92-.79 0-2.01-.9-3.31-.87-1.7.03-3.27.99-4.14 2.51-1.77 3.06-.45 7.59 1.27 10.07.84 1.21 1.84 2.58 3.14 2.53 1.27-.05 1.74-.81 3.27-.81 1.53 0 1.96.81 3.3.79 1.36-.03 2.22-1.24 3.05-2.45.96-1.41 1.36-2.78 1.38-2.85-.03-.01-2.65-1.02-2.68-4.06zM14.5 4.13c.7-.85 1.18-2.04 1.05-3.22-1.01.04-2.24.67-2.97 1.51-.65.74-1.22 1.94-1.07 3.1 1.13.09 2.29-.57 2.99-1.39z" />
    </svg>
  )
}

function ZenitechWordmark() {
  return (
    <span
      style={{
        fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
        fontWeight: 600,
        color: '#ffffff',
        lineHeight: 1,
        letterSpacing: '-0.4px',
        fontSize: 14,
      }}
    >
      Zenitech
    </span>
  )
}

export default function GlobalNav() {
  const navigate = useNavigate()
  const { user, role, logout } = useAuthContext()
  const totalItems = useCartStore((state) => state.getTotalItems())
  const openCart = useCartStore((state) => state.openCart)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    if (!userMenuOpen) return
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const userInitial = user
    ? (
        user.user_metadata?.full_name?.trim()?.charAt(0)?.toUpperCase() ||
        user.email?.charAt(0)?.toUpperCase() ||
        '?'
      )
    : null

  const handleLogout = async () => {
    setUserMenuOpen(false)
    setDrawerOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <>
      <nav
        className="bg-surface-black sticky top-0"
        style={{ height: 44, zIndex: 50 }}
      >
        <div
          className="relative flex items-center h-full"
          style={{
            maxWidth: 1024,
            margin: '0 auto',
            paddingLeft: 22,
            paddingRight: 22,
          }}
        >
          {/* MOBILE: hamburger left */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
            className="active-scale min-[834px]:hidden flex items-center justify-center"
            style={{
              width: 32, height: 32, color: '#ffffff',
              background: 'transparent', border: 'none', padding: 0,
            }}
          >
            <HamburgerIcon className="w-5 h-5" />
          </button>

          {/* DESKTOP: full nav row */}
          <div className="hidden min-[834px]:flex items-center w-full" style={{ gap: 0 }}>
            {/* Brand */}
            <Link
              to="/"
              className="active-scale flex items-center"
              aria-label="Zenitech home"
              style={{ gap: 8, padding: '4px 8px', textDecoration: 'none' }}
            >
              <AppleLogo size={16} />
              <ZenitechWordmark />
            </Link>

            {/* Spacer push links to center */}
            <div style={{ flex: 1 }} />

            {/* Center nav links */}
            <div className="flex items-center" style={{ gap: 0 }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-on-dark active-scale"
                  style={{
                    fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                    fontSize: 12,
                    fontWeight: 400,
                    letterSpacing: '-0.12px',
                    padding: '4px 10px',
                    opacity: 0.88,
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.88')}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ flex: 1 }} />

            {/* Right cluster */}
            <div className="flex items-center" style={{ gap: 8 }}>
              <button
                type="button"
                onClick={() => navigate('/products')}
                aria-label="Cari produk"
                className="active-scale flex items-center justify-center"
                style={{
                  width: 28, height: 28, color: '#ffffff',
                  background: 'transparent', border: 'none', padding: 0,
                  opacity: 0.88,
                }}
              >
                <SearchIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={openCart}
                aria-label={totalItems > 0 ? `Keranjang, ${totalItems} item` : 'Keranjang'}
                className="active-scale relative flex items-center justify-center"
                style={{
                  width: 28, height: 28, color: '#ffffff',
                  background: 'transparent', border: 'none', padding: 0,
                  cursor: 'pointer', opacity: 0.88,
                }}
              >
                <BagIcon className="w-4 h-4" />
                {totalItems > 0 && (
                  <span
                    className="bg-primary text-on-primary absolute"
                    aria-hidden="true"
                    style={{
                      top: -2, right: -4, minWidth: 16, height: 16,
                      borderRadius: 9999, padding: '0 4px',
                      fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                      fontSize: 10, fontWeight: 600,
                      lineHeight: 1, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              <div className="relative" ref={userMenuRef} style={{ marginLeft: 4 }}>
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen((o) => !o)}
                      aria-label="Menu pengguna"
                      aria-expanded={userMenuOpen}
                      className="active-scale flex items-center justify-center"
                      style={{
                        width: 24, height: 24, borderRadius: 9999,
                        backgroundColor: '#0066cc', color: '#ffffff',
                        fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                        fontSize: 11, fontWeight: 600,
                        border: 'none', padding: 0,
                      }}
                    >
                      {userInitial}
                    </button>
                    {userMenuOpen && (
                      <div
                        role="menu"
                        className="absolute bg-canvas text-ink"
                        style={{
                          top: 'calc(100% + 12px)',
                          right: 0,
                          minWidth: 200,
                          borderRadius: 11,
                          boxShadow: 'rgba(0,0,0,0.12) 0 8px 24px',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="text-body-base text-ink block"
                          style={{ padding: '12px 17px', textDecoration: 'none' }}
                        >
                          Profil
                        </Link>
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="text-body-base text-ink block"
                          style={{ padding: '12px 17px', textDecoration: 'none' }}
                        >
                          Pesanan Saya
                        </Link>
                        {role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="text-body-base text-ink block"
                            style={{ padding: '12px 17px', textDecoration: 'none' }}
                          >
                            Admin
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="text-body-base text-ink w-full text-left"
                          style={{
                            padding: '12px 17px',
                            borderTop: '1px solid #f0f0f0',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          Keluar
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="text-on-dark active-scale"
                    style={{
                      fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                      fontSize: 12,
                      letterSpacing: '-0.12px',
                      padding: '4px 8px',
                      opacity: 0.88,
                      textDecoration: 'none',
                    }}
                  >
                    Masuk
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE: center logo */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 active-scale min-[834px]:hidden flex items-center"
            aria-label="Zenitech home"
            style={{ gap: 6, textDecoration: 'none' }}
          >
            <AppleLogo size={14} />
            <ZenitechWordmark />
          </Link>

          {/* MOBILE: right cluster */}
          <div className="flex items-center min-[834px]:hidden ml-auto" style={{ gap: 8 }}>
            <button
              type="button"
              onClick={openCart}
              aria-label={totalItems > 0 ? `Keranjang, ${totalItems} item` : 'Keranjang'}
              className="active-scale relative flex items-center justify-center"
              style={{
                width: 32, height: 32, color: '#ffffff',
                background: 'transparent', border: 'none', padding: 0,
              }}
            >
              <BagIcon className="w-4 h-4" />
              {totalItems > 0 && (
                <span
                  className="bg-primary text-on-primary absolute"
                  aria-hidden="true"
                  style={{
                    top: -2, right: -4, minWidth: 18, height: 18,
                    borderRadius: 9999, padding: '0 5px',
                    fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                    fontSize: 10, fontWeight: 600,
                    lineHeight: 1, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <div
          className="fixed inset-0 min-[834px]:hidden"
          style={{ zIndex: 60 }}
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} />
          <aside
            className="absolute top-0 left-0 h-full bg-surface-black"
            style={{ width: '80%', maxWidth: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between"
              style={{ height: 44, padding: '0 22px' }}
            >
              <span className="flex items-center" style={{ gap: 8 }}>
                <AppleLogo size={16} />
                <ZenitechWordmark />
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup menu"
                className="active-scale flex items-center justify-center"
                style={{
                  width: 32, height: 32, color: '#ffffff',
                  background: 'transparent', border: 'none', padding: 0,
                }}
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col" style={{ padding: '12px 0' }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setDrawerOpen(false)}
                  className="text-on-dark"
                  style={{
                    fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
                    fontSize: 21, fontWeight: 600,
                    letterSpacing: '0.231px',
                    padding: '12px 22px',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ borderTop: '1px solid #2a2a2c', margin: '12px 0' }} />
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setDrawerOpen(false)}
                    className="text-on-dark"
                    style={{
                      fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                      fontSize: 14, padding: '12px 22px', textDecoration: 'none',
                    }}
                  >
                    Profil
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setDrawerOpen(false)}
                    className="text-on-dark"
                    style={{
                      fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                      fontSize: 14, padding: '12px 22px', textDecoration: 'none',
                    }}
                  >
                    Pesanan Saya
                  </Link>
                  {role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDrawerOpen(false)}
                      className="text-on-dark"
                      style={{
                        fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                        fontSize: 14, padding: '12px 22px', textDecoration: 'none',
                      }}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-on-dark text-left"
                    style={{
                      fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                      fontSize: 14, padding: '12px 22px',
                      background: 'transparent', border: 'none',
                    }}
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="text-on-dark"
                  style={{
                    fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                    fontSize: 14, padding: '12px 22px', textDecoration: 'none',
                  }}
                >
                  Masuk
                </Link>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
