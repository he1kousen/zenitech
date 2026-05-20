import { useEffect } from 'react'

const DEFAULT_TITLE = 'Zenitech — Apple Authorized Reseller'
const DEFAULT_DESCRIPTION =
  'Beli iPhone, Mac, iPad, Apple Watch, dan aksesoris resmi di Zenitech. Pembayaran aman lewat Midtrans, pengiriman ke seluruh Indonesia.'

const ensureMeta = (name) => {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  return el
}

/**
 * Set document.title + meta description per halaman.
 *
 *   usePageMeta({ title: 'Cart — Zenitech', description: '...' })
 *
 * Title diformat otomatis ke "[title] — Zenitech" jika tidak mengandung "Zenitech".
 */
export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    const fullTitle = title
      ? title.includes('Zenitech')
        ? title
        : `${title} — Zenitech`
      : DEFAULT_TITLE

    const prevTitle = document.title
    document.title = fullTitle

    const descMeta = ensureMeta('description')
    const prevDesc = descMeta.getAttribute('content') || ''
    descMeta.setAttribute('content', description || DEFAULT_DESCRIPTION)

    return () => {
      // Restore title saja — description di-overwrite oleh halaman berikutnya
      document.title = prevTitle
      if (prevDesc) descMeta.setAttribute('content', prevDesc)
    }
  }, [title, description])
}

export default usePageMeta
