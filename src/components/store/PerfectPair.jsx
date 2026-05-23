import { useState } from 'react'

const PAIRS = [
  {
    id: 'iphone-mac',
    title: 'iPhone dan Mac',
    body:
      'Dengan Pencerminan iPhone, Anda bisa melihat layar iPhone Anda di Mac dan mengontrolnya tanpa perlu menyentuh ponsel Anda. Fitur Berkelanjutan juga memungkinkan Anda menjawab panggilan atau pesan, langsung dari Mac. Anda bahkan bisa menyalin gambar, video, atau teks dari iPhone, lalu menempelkan semuanya ke aplikasi lain di Mac. Dan dengan iCloud, Anda bisa mengakses file Anda dari salah satu perangkat.',
  },
  {
    id: 'iphone-watch',
    title: 'iPhone dan Apple Watch',
    body:
      'Apple Watch bekerja paling baik dengan iPhone. Notifikasi tersinkron secara otomatis, latihan Anda terekam di aplikasi Kebugaran, dan fitur seperti Buka Kunci dengan Apple Watch membuat penggunaan Mac dan iPhone terasa mulus. Tetap terhubung tanpa perlu mengeluarkan ponsel Anda.',
  },
  {
    id: 'iphone-airpods',
    title: 'iPhone dan AirPods',
    body:
      'Sambungkan AirPods sekali, lalu gunakan di seluruh perangkat Apple Anda. Audio Spasial yang dipersonalisasi memberikan pengalaman mendengar yang imersif untuk musik dan film. Dengan iPhone, AirPods otomatis berpindah ke perangkat yang sedang Anda gunakan.',
  },
]

function ChevronIcon({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{
        transition: 'transform 0.25s ease',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      }}
      aria-hidden="true"
    >
      <path
        d="M3 5l4 4 4-4"
        stroke="#1d1d1f"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PerfectPair() {
  const [openId, setOpenId] = useState(PAIRS[0].id)

  return (
    <section
      style={{
        backgroundColor: '#ffffff',
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 22px' }}>
        <h2
          style={{
            fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: '-0.005em',
            color: '#1d1d1f',
            marginBottom: 32,
          }}
        >
          Pasangan sempurna.
        </h2>

        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 18,
            padding: 'clamp(24px, 4vw, 48px)',
          }}
        >
          {PAIRS.map((pair) => {
            const open = openId === pair.id
            return (
              <div
                key={pair.id}
                style={{
                  borderBottom: '1px solid #d2d2d7',
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : pair.id)}
                  aria-expanded={open}
                  aria-controls={`pair-panel-${pair.id}`}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '24px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    textAlign: 'left',
                    color: '#1d1d1f',
                    fontFamily: "'SF Pro Display', system-ui, -apple-system, sans-serif",
                    fontSize: 'clamp(20px, 2.4vw, 24px)',
                    fontWeight: 600,
                    lineHeight: 1.16,
                    letterSpacing: '0.009em',
                  }}
                >
                  <span>{pair.title}</span>
                  <ChevronIcon open={open} />
                </button>

                <div
                  id={`pair-panel-${pair.id}`}
                  role="region"
                  style={{
                    overflow: 'hidden',
                    maxHeight: open ? 480 : 0,
                    opacity: open ? 1 : 0,
                    transition: 'max-height 0.35s ease, opacity 0.25s ease, padding 0.25s ease',
                    paddingBottom: open ? 24 : 0,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
                      fontSize: 17,
                      fontWeight: 400,
                      lineHeight: 1.47,
                      letterSpacing: '-0.022em',
                      color: '#1d1d1f',
                      maxWidth: 640,
                      margin: 0,
                    }}
                  >
                    {pair.body}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
