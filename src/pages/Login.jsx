import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Login() {
  usePageMeta({
    title: 'Masuk — Zenitech',
    description: 'Masuk ke akun Zenitech untuk checkout dan tracking pesanan.',
  })

  const navigate = useNavigate()
  const { user, login, loginWithGoogle, loading: authLoading } = useAuthContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/')
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Login gagal. Silakan coba lagi.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    const result = await loginWithGoogle()

    if (!result.success) {
      setError(result.error || 'Login dengan Google gagal.')
    }
  }

  if (authLoading) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-canvas-parchment">
      {/* Left Side - Product Image (hidden on mobile) */}
      <div className="hidden md:flex md:w-[55%] items-center justify-center flex-col relative bg-surface-tile-1">
        {/* Logo Zenitech - Top Left */}
        <div className="absolute top-8 left-8">
          <span className="text-tagline font-display text-on-dark">
            <span className="text-primary-on-dark">Z</span>enitech
          </span>
        </div>

        {/* Product Mockup - Center */}
        <div className="flex flex-col items-center">
          <p className="text-caption font-text text-body-muted mb-sm">
            Reseller Resmi Apple
          </p>
          <h1 className="text-hero-display font-display text-on-dark mb-xl">
            iPhone 16 Pro.
          </h1>

          {/* CSS Product Mockup */}
          <div className="flex items-center justify-center product-shadow" style={{
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)'
          }}>
            <span className="text-tagline font-display text-on-dark">iPhone 16 Pro</span>
          </div>
        </div>

        {/* Quote - Bottom Left */}
        <div className="absolute bottom-8 left-8">
          <p className="text-caption font-text italic text-body-muted">
            Produk Apple original. Garansi resmi.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-canvas px-lg py-xxl">
        <div className="w-full max-w-md px-xl py-xl">
          {/* Logo Zenitech - Above Form */}
          <div className="flex items-center mb-lg gap-xs">
            <div className="flex items-center justify-center bg-primary rounded-sm" style={{ width: '32px', height: '32px' }}>
              <span className="text-on-primary text-button-large">Z</span>
            </div>
            <span className="text-body-strong font-text text-ink">Zenitech</span>
          </div>

          {/* Headline */}
          <h1 className="text-display-md font-display text-ink mb-xs">
            Masuk ke Zenitech
          </h1>

          <p className="text-body-base font-text text-ink-muted-48 mb-xl">
            Selamat datang kembali
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-lg text-caption text-red-600">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="gap-md" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-caption-strong font-text text-ink mb-xs">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-canvas text-ink border border-hairline rounded-sm focus:outline-none focus:ring-2 ring-primary px-md py-sm text-body-base font-text"
                placeholder="nama@email.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-caption-strong font-text text-ink mb-xs">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-canvas text-ink border border-hairline rounded-sm focus:outline-none focus:ring-2 ring-primary px-md py-sm text-body-base font-text"
                  style={{ paddingRight: '90px' }}
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-ink-muted-48 hover:text-ink"
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-md">
            <div className="flex-1 border-t border-hairline"></div>
            <span className="px-sm text-caption text-ink-muted-48">atau</span>
            <div className="flex-1 border-t border-hairline"></div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn-secondary-pill w-full"
          >
            Masuk dengan Google
          </button>

          {/* Register Link */}
          <p className="mt-md text-center text-body-base text-ink font-text">
            Belum punya akun?{' '}
            <Link to="/register" className="text-link">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
