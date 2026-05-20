import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFound() {
  usePageMeta({
    title: '404 — Halaman tidak ditemukan',
    description: 'Halaman yang kamu cari tidak tersedia di Zenitech.',
  })

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f5f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 17,
        }}
      >
        <h1
          className="text-hero-display text-ink"
          style={{ margin: 0 }}
        >
          404
        </h1>
        <p className="text-lead text-ink" style={{ margin: 0 }}>
          Halaman tidak ditemukan
        </p>
        <p
          className="text-body-base text-ink-muted-48"
          style={{ margin: 0, maxWidth: 360 }}
        >
          Sepertinya kamu salah belok. Halaman yang kamu cari sudah
          dipindahkan, atau memang belum pernah ada.
        </p>
        <Link to="/" className="btn-primary active-scale" style={{ marginTop: 8 }}>
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  )
}
