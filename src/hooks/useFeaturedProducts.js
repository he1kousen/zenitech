import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useFeaturedProducts(limit = 4) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchFeatured = async () => {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          base_price,
          category:categories ( name, slug ),
          images:product_images ( url, is_primary, sort_order )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      const normalized = (data || []).map((p) => {
        const primary = p.images?.find((img) => img.is_primary)
        const fallback = p.images?.[0]
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          base_price: p.base_price,
          image_url: primary?.url || fallback?.url || null,
          category: p.category?.name || null,
        }
      })

      setProducts(normalized)
      setLoading(false)
    }

    fetchFeatured()

    return () => {
      cancelled = true
    }
  }, [limit])

  return { products, loading, error }
}
