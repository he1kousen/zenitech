// Mapping product slug → official Apple CDN image URL.
// Sumber: store.storeimages.cdn-apple.com (publik).
// PENTING: jangan pakai parameter `.v=...` (signed hash) — expired tanpa
// tanda di browser. Format bersih: `?wid=...&hei=...&fmt=png-alpha`.
//
// Semua URL di file ini sudah diverifikasi load (returns image data) per
// 2026-05-20.

const APPLE_CDN = 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is'
const Q = '?wid=1200&hei=900&fmt=png-alpha'

const apple = (id) => `${APPLE_CDN}/${id}${Q}`

export const PRODUCT_IMAGES = {
  'iphone-16-pro-max': apple('iphone-16-pro-finish-select-202409-6-9inch-deserttitanium'),
  'iphone-16': apple('iphone-16-finish-select-202409-6-1inch-ultramarine'),
  'iphone-15': apple('iphone-15-finish-select-202309-6-1inch-pink'),

  'macbook-air-m3-13': apple('mba13-midnight-select-202402'),
  'macbook-pro-m4-14': apple('mbp14-spaceblack-select-202410'),

  // iPad Pro 11" 2022 (URL 2024 11-inch saat ini 404 di CDN — pakai 2022 sebagai stand-in clean)
  'ipad-pro-m4-11': apple('ipad-pro-11-select-wifi-spacegray-202210'),

  'apple-watch-series-10': apple('watch-case-46-aluminum-jetblack-nc-s10'),

  'airpods-pro-2': apple('MTJV3'),
  'apple-pencil-pro': apple('MX2D3'),
}

// Per-kategori fallback image (untuk produk yang slug-nya tidak ada di mapping).
export const CATEGORY_FALLBACK_IMAGES = {
  iphone: PRODUCT_IMAGES['iphone-16-pro-max'],
  mac: PRODUCT_IMAGES['macbook-pro-m4-14'],
  ipad: PRODUCT_IMAGES['ipad-pro-m4-11'],
  'apple-watch': PRODUCT_IMAGES['apple-watch-series-10'],
  watch: PRODUCT_IMAGES['apple-watch-series-10'],
  aksesoris: PRODUCT_IMAGES['airpods-pro-2'],
}

// Last-resort fallback yang selalu work (di-host oleh placeholder neutral).
export const ULTIMATE_FALLBACK = PRODUCT_IMAGES['iphone-16-pro-max']

const PLACEHOLDER_HOSTS = ['placehold.co', 'placeholder.com', 'via.placeholder.com']

function isPlaceholder(url) {
  if (!url || typeof url !== 'string') return true
  return PLACEHOLDER_HOSTS.some((h) => url.includes(h))
}

function categorySlug(category) {
  if (!category) return null
  if (typeof category === 'string') return category.toLowerCase().replace(/\s+/g, '-')
  return null
}

/**
 * Resolve gambar produk yang clean.
 * - Kalau slug ada di mapping → pakai URL Apple CDN.
 * - Kalau image_url valid (bukan placeholder) → pakai itu.
 * - Kalau tidak ada → fallback per kategori.
 */
export function resolveProductImage({ slug, image_url, category }) {
  if (slug && PRODUCT_IMAGES[slug]) return PRODUCT_IMAGES[slug]
  if (!isPlaceholder(image_url)) return image_url
  const cat = categorySlug(category)
  if (cat && CATEGORY_FALLBACK_IMAGES[cat]) return CATEGORY_FALLBACK_IMAGES[cat]
  return ULTIMATE_FALLBACK
}
