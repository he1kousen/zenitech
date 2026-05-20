import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProduct(slug) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return

    let cancelled = false

    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          slug,
          description,
          base_price,
          is_active,
          category:categories ( id, name, slug ),
          images:product_images ( id, url, is_primary, sort_order ),
          variants:product_variants ( id, storage, color, price_modifier, stock, sku )
        `
        )
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle()

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const sortedImages = [...(data.images || [])].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1
        if (!a.is_primary && b.is_primary) return 1
        return (a.sort_order || 0) - (b.sort_order || 0)
      })

      setProduct({
        ...data,
        images: sortedImages,
        variants: data.variants || [],
      })
      setLoading(false)
    }

    fetchProduct()

    return () => {
      cancelled = true
    }
  }, [slug])

  return { product, loading, error, notFound }
}
