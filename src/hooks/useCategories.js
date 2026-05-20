import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    const fetchCategories = async () => {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('id, name, slug, icon_url')
        .order('name', { ascending: true })

      if (cancelled) return

      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setCategories(data || [])
      setLoading(false)
    }

    fetchCategories()

    return () => {
      cancelled = true
    }
  }, [])

  return { categories, loading, error }
}
