import { useState } from 'react'

/**
 * SafeImage — img dengan onerror fallback otomatis.
 *
 * Kalau src utama gagal load (404, blocked, dll), akan coba fallback berikutnya.
 * Setelah fallback terakhir habis, tetap render img kosong (alt tetap accessible).
 */
export default function SafeImage({ src, fallbacks = [], alt = '', ...rest }) {
  const sources = [src, ...fallbacks].filter(Boolean)
  const [idx, setIdx] = useState(0)

  if (sources.length === 0) return null

  return (
    <img
      src={sources[idx]}
      alt={alt}
      onError={() => {
        if (idx < sources.length - 1) setIdx(idx + 1)
      }}
      {...rest}
    />
  )
}
