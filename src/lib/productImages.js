export const PRODUCT_IMAGES = {
  'iphone-15-pro-max': '/images/products/iphone-15-pro-max-1.webp',
  'iphone-14-pro-max': '/images/products/iphone-14-pro-max-1.webp',
  'iphone-13': '/images/products/iphone-13-1.webp',
  'iphone-12': '/images/products/iphone-12-1.webp',
  'macbook-air-m2': '/images/products/macbook-air-m2-1.webp',
  'apple-watch-nike-s3': '/images/products/apple-watch-nike-s3-1.webp',
  'beats-studio-elite': '/images/products/beats-studio-elite-1.webp',
  'playstation-dualsense': '/images/products/playstation-dualsense-1.webp',
}

// Per-kategori fallback image (untuk produk yang slug-nya tidak ada di mapping).
export const CATEGORY_FALLBACK_IMAGES = {
  iphone: PRODUCT_IMAGES['iphone-15-pro-max'],
  mac: PRODUCT_IMAGES['macbook-air-m2'],
  ipad: PRODUCT_IMAGES['macbook-air-m2'],
  'apple-watch': PRODUCT_IMAGES['apple-watch-nike-s3'],
  watch: PRODUCT_IMAGES['apple-watch-nike-s3'],
  aksesoris: PRODUCT_IMAGES['beats-studio-elite'],
}

// Last-resort fallback yang selalu work
export const ULTIMATE_FALLBACK = PRODUCT_IMAGES['iphone-15-pro-max']

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
 * Resolve gambar produk.
 * - Kalau slug ada di mapping → pakai URL lokal.
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
