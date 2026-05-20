import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthContext } from '../contexts/AuthContext'
import { usePageMeta } from '../hooks/usePageMeta'

export default function Register() {
  usePageMeta({
    title: 'Daftar — Zenitech',
    description: 'Buat akun Zenitech untuk belanja produk Apple resmi.',
  })

  const navigate = useNavigate()
  const { user, register, loginWithGoogle, loading: authLoading } = useAuthContext()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/')
    }
  }, [user, authLoading, navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi'
    }

    if (!email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Format email tidak valid'
    }

    if (!password) {
      newErrors.password = 'Password wajib diisi'
    } else if (password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak sama'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setErrors({})

    const result = await register(email, password, fullName)

    if (result.success) {
      navigate('/')
    } else {
      setErrors({ general: result.error || 'Pendaftaran gagal. Silakan coba lagi.' })
      setLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setErrors({})
    const result = await loginWithGoogle()

    if (!result.success) {
      setErrors({ general: result.error || 'Pendaftaran dengan Google gagal.' })
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

      {/* Right Side - Register Form */}
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
            Buat Akun Baru
          </h1>

          <p className="text-body-base font-text text-ink-muted-48 mb-xl">
            Bergabunglah dengan Zenitech
          </p>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-lg text-caption text-red-600">
              {errors.general}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="gap-md" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Full Name Input */}
            <div>
              <label htmlFor="fullName" className="block text-caption-strong font-text text-ink mb-xs">
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-canvas text-ink border border-hairline rounded-sm focus:outline-none focus:ring-2 ring-primary px-md py-sm text-body-base font-text"
                placeholder="Nama lengkap Anda"
              />
              {errors.fullName && (
                <p className="mt-xs text-caption text-red-600">
                  {errors.fullName}
                </p>
              )}
            </div>

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
                className="w-full bg-canvas text-ink border border-hairline rounded-sm focus:outline-none focus:ring-2 ring-primary px-md py-sm text-body-base font-text"
                placeholder="nama@email.com"
              />
              {errors.email && (
                <p className="mt-xs text-caption text-red-600">
                  {errors.email}
                </p>
              )}
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
                  className="w-full bg-canvas text-ink border border-hairline rounded-sm focus:outline-none focus:ring-2 ring-primary px-md py-sm text-body-base font-text"
                  style={{ paddingRight: '90px' }}
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-ink-muted-48 hover:text-ink"
                >
                  {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-xs text-caption text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-caption-strong font-text text-ink mb-xs">
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-canvas text-ink border border-hairline rounded-sm focus:outline-none focus:ring-2 ring-primary px-md py-sm text-body-base font-text"
                  style={{ paddingRight: '90px' }}
                  placeholder="Ketik ulang password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-ink-muted-48 hover:text-ink"
                >
                  {showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-xs text-caption text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
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
                'Daftar'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-md">
            <div className="flex-1 border-t border-hairline"></div>
            <span className="px-sm text-caption text-ink-muted-48">atau</span>
            <div className="flex-1 border-t border-hairline"></div>
          </div>

          {/* Google Register Button */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            className="btn-secondary-pill w-full"
          >
            Daftar dengan Google
          </button>

          {/* Login Link */}
          <p className="mt-md text-center text-body-base text-ink font-text">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-link">
              Masuk sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
