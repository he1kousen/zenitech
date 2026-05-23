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
    <div className="min-h-screen flex flex-col bg-canvas px-4 pb-20" style={{ fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif" }}>
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[400px] mx-auto mt-20 md:mt-0">
        {/* Logo */}
        <Link to="/" className="mb-6 active-scale">
          <div className="flex items-center justify-center bg-primary rounded-sm" style={{ width: '48px', height: '48px' }}>
            <span className="text-on-primary text-display-md" style={{ lineHeight: 1 }}>Z</span>
          </div>
        </Link>

        {/* Headline */}
        <h1 
          className="text-ink mb-12 text-center" 
          style={{ 
            fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
            fontSize: '34px',
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: '-0.374px'
          }}
        >
          Buat Akun Baru
        </h1>

        {/* General Error Message */}
        {errors.general && (
          <div className="w-full mb-6 p-4 bg-red-50 text-red-600 rounded-sm text-caption text-center">
            {errors.general}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div>
            <label htmlFor="fullName" className="sr-only">Nama Lengkap</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full bg-canvas text-ink border ${errors.fullName ? 'border-red-500' : 'border-hairline'} rounded-sm focus:outline-none focus:border-primary px-4 py-3 text-body-base placeholder:text-body-muted transition-colors`}
              placeholder="Nama Lengkap"
            />
            {errors.fullName && (
              <p className="mt-2 text-caption text-red-600">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full bg-canvas text-ink border ${errors.email ? 'border-red-500' : 'border-hairline'} rounded-sm focus:outline-none focus:border-primary px-4 py-3 text-body-base placeholder:text-body-muted transition-colors`}
              placeholder="Email"
            />
            {errors.email && (
              <p className="mt-2 text-caption text-red-600">
                {errors.email}
              </p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full bg-canvas text-ink border ${errors.password ? 'border-red-500' : 'border-hairline'} rounded-sm focus:outline-none focus:border-primary px-4 py-3 text-body-base placeholder:text-body-muted transition-colors`}
              placeholder="Password (Min. 8 Karakter)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-caption text-ink hover:text-primary transition-colors"
              style={{ fontWeight: 600 }}
            >
              {showPassword ? 'Sembunyikan' : 'Tampilkan'}
            </button>
            {errors.password && (
              <p className="mt-2 text-caption text-red-600">
                {errors.password}
              </p>
            )}
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="sr-only">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-canvas text-ink border ${errors.confirmPassword ? 'border-red-500' : 'border-hairline'} rounded-sm focus:outline-none focus:border-primary px-4 py-3 text-body-base placeholder:text-body-muted transition-colors`}
              placeholder="Konfirmasi Password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-caption text-ink hover:text-primary transition-colors"
              style={{ fontWeight: 600 }}
            >
              {showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
            </button>
            {errors.confirmPassword && (
              <p className="mt-2 text-caption text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
            style={{ padding: '16px 24px', fontSize: '17px' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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

        <div className="w-full flex items-center my-8">
          <div className="flex-1 border-t border-hairline"></div>
          <span className="px-4 text-caption text-body-muted">atau</span>
          <div className="flex-1 border-t border-hairline"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          className="btn-secondary-pill w-full flex items-center justify-center gap-3"
          style={{ padding: '16px 24px', fontSize: '17px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84A10.993 10.993 0 0012 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16A10.978 10.978 0 001 12c0 1.77.42 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Daftar dengan Google
        </button>

        <p className="mt-10 text-center text-body-base text-ink">
          Sudah punya akun Zenitech?{' '}
          <Link to="/login" className="text-link active-scale inline-block">
            Masuk sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}
