import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/products', label: 'Produk', icon: '📦' },
  { to: '/admin/orders', label: 'Pesanan', icon: '🛒' },
  { to: '/admin/categories', label: 'Kategori', icon: '🏷️' },
]

const SIDEBAR_WIDTH = 240

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SidebarNav({ onNavigate }) {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          end={item.to === '/admin/dashboard'}
          className="active-scale"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            borderRadius: 8,
            textDecoration: 'none',
            background: isActive ? '#0066cc' : 'transparent',
            color: '#ffffff',
            fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif',
            fontSize: 14,
            fontWeight: isActive ? 600 : 400,
            letterSpacing: '-0.224px',
            lineHeight: 1.29,
            transition: 'background 0.15s ease',
          })}
          onMouseEnter={(e) => {
            if (!e.currentTarget.style.background.includes('rgb(0, 102, 204)')) {
              const isActiveLink = e.currentTarget.getAttribute('aria-current') === 'page'
              if (!isActiveLink) e.currentTarget.style.background = '#2a2a2c'
            }
          }}
          onMouseLeave={(e) => {
            const isActiveLink = e.currentTarget.getAttribute('aria-current') === 'page'
            if (!isActiveLink) e.currentTarget.style.background = 'transparent'
          }}
        >
          <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarContent({ user, onLogout, onNavigate }) {
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Admin'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#272729',
        color: '#ffffff',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 24px 32px' }}>
        <h1
          className="text-tagline"
          style={{ color: '#ffffff', margin: 0 }}
        >
          Zenitech Admin
        </h1>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <SidebarNav onNavigate={onNavigate} />
      </div>

      {/* User Info */}
      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <p
          className="text-caption-strong"
          style={{
            color: '#ffffff',
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </p>
        <p
          className="text-fine-print"
          style={{
            color: '#cccccc',
            margin: '4px 0 12px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user?.email}
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="active-scale"
          style={{
            width: '100%',
            background: 'transparent',
            color: '#2997ff',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 8,
            padding: '8px 12px',
            fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif',
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: '-0.224px',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#2a2a2c')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const closeMobile = () => setMobileOpen(false)

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      {/* Mobile Top Bar */}
      <header
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 17px',
          background: '#272729',
          color: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
        className="admin-mobile-bar"
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu"
          className="active-scale"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            padding: 8,
            display: 'inline-flex',
            cursor: 'pointer',
          }}
        >
          <HamburgerIcon />
        </button>
        <span className="text-tagline" style={{ color: '#ffffff' }}>
          Zenitech Admin
        </span>
        <span style={{ width: 36 }} aria-hidden="true" />
      </header>

      {/* Desktop Sidebar (fixed) */}
      <aside
        className="admin-sidebar-desktop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          zIndex: 20,
        }}
      >
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            onClick={closeMobile}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 40,
            }}
            aria-hidden="true"
          />
          <aside
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: SIDEBAR_WIDTH,
              zIndex: 50,
            }}
            role="dialog"
            aria-label="Menu admin"
          >
            <div style={{ position: 'relative', height: '100%' }}>
              <button
                type="button"
                onClick={closeMobile}
                aria-label="Tutup menu"
                className="active-scale"
                style={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  padding: 8,
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              >
                <CloseIcon />
              </button>
              <SidebarContent
                user={user}
                onLogout={handleLogout}
                onNavigate={closeMobile}
              />
            </div>
          </aside>
        </>
      )}

      {/* Content area */}
      <main
        className="admin-content"
        style={{
          paddingLeft: SIDEBAR_WIDTH,
          minHeight: '100vh',
        }}
      >
        <div style={{ padding: 24 }}>{children}</div>
      </main>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 833px) {
          .admin-mobile-bar { display: flex !important; }
          .admin-sidebar-desktop { display: none !important; }
          .admin-content { padding-left: 0 !important; }
        }
      `}</style>
    </div>
  )
}
