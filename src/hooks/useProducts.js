import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProducts({
  categorySlug = null,
  minPrice = null,
  maxPrice = null,
  search = '',
  page = 1,
  pageSize = 12,
} = {}) {
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      let categoryId = null
      if (categorySlug && categorySlug !== 'all') {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .maybeSingle()

        if (cancelled) return

        if (catError) {
          setError(catError.message)
          setLoading(false)
          return
        }

        if (!catData) {
          setProducts([])
          setTotal(0)
          setLoading(false)
          return
        }
        categoryId = catData.id
      }

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('products')
        .select(
          `
          id,
          name,
          slug,
          base_price,
          category:categories ( name, slug ),
          images:product_images ( url, is_primary, sort_order )
        `,
          { count: 'exact' }
        )
        .eq('is_active', true)

      if (categoryId) query = query.eq('category_id', categoryId)
      if (minPrice != null && minPrice !== '') query = query.gte('base_price', minPrice)
      if (maxPrice != null && maxPrice !== '') query = query.lte('base_price', maxPrice)
      if (search && search.trim()) query = query.ilike('name', `%${search.trim()}%`)

      query = query.order('created_at', { ascending: false }).range(from, to)

      const { data, count, error: fetchError } = await query

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
      setTotal(count || 0)
      setLoading(false)
    }

    fetchProducts()

    return () => {
      cancelled = true
    }
  }, [categorySlug, minPrice, maxPrice, search, page, pageSize])

  return { products, total, loading, error }
}
