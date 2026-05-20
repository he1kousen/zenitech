import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'product-images'
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPE_PREFIX = 'image/'
const ACCEPTED_EXACT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const sanitizeFileName = (name) =>
  String(name || 'file')
    .toLowerCase()
    .replace(/\.[^.]+$/, '') // strip ext
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'file'

const validate = (file) => {
  if (!file) return 'File tidak ditemukan.'
  if (!file.type?.startsWith(ACCEPTED_TYPE_PREFIX)) {
    return 'File harus berupa gambar.'
  }
  if (!ACCEPTED_EXACT_TYPES.includes(file.type)) {
    return 'Format tidak didukung. Gunakan JPG/PNG/WebP.'
  }
  if (file.size > MAX_SIZE) {
    return 'Ukuran file maks 5MB.'
  }
  return null
}

// Ekstrak object path dari public URL Supabase Storage.
// Contoh: https://xxx.supabase.co/storage/v1/object/public/product-images/<productId>/file.png
//   → { bucket: 'product-images', path: '<productId>/file.png' }
const parseStorageUrl = (url) => {
  if (!url) return null
  const marker = '/storage/v1/object/public/'
  const idx = url.indexOf(marker)
  if (idx < 0) return null
  const rest = url.slice(idx + marker.length)
  const slash = rest.indexOf('/')
  if (slash < 0) return null
  return {
    bucket: rest.slice(0, slash),
    path: rest.slice(slash + 1).split('?')[0],
  }
}

export function useImageUpload({ folder = '' } = {}) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadImage = useCallback(
    async (file, { folder: folderOverride } = {}) => {
      setError(null)

      const validationError = validate(file)
      if (validationError) {
        setError(validationError)
        throw new Error(validationError)
      }

      setUploading(true)
      setProgress(10) // pseudo-progress (Supabase JS belum expose progress event)

      try {
        const ext = file.name.split('.').pop() || 'jpg'
        const baseName = sanitizeFileName(file.name)
        const unique = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}-${baseName}.${ext.toLowerCase()}`

        const dir = (folderOverride ?? folder) || ''
        const path = dir ? `${dir.replace(/^\/+|\/+$/g, '')}/${unique}` : unique

        setProgress(40)

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          })

        if (uploadError) throw uploadError
        setProgress(80)

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
        setProgress(100)

        return { url: data.publicUrl, path }
      } catch (err) {
        const msg = err?.message || 'Gagal mengunggah gambar.'
        setError(msg)
        throw err
      } finally {
        setUploading(false)
      }
    },
    [folder]
  )

  const deleteImage = useCallback(async (url) => {
    setError(null)
    const parsed = parseStorageUrl(url)
    if (!parsed) {
      // Bukan URL Supabase — anggap selesai tanpa aksi.
      return { skipped: true }
    }
    const { error: removeError } = await supabase.storage
      .from(parsed.bucket)
      .remove([parsed.path])
    if (removeError) {
      const msg = removeError.message || 'Gagal menghapus gambar.'
      setError(msg)
      throw removeError
    }
    return { skipped: false }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setProgress(0)
    setUploading(false)
  }, [])

  return {
    uploading,
    progress,
    error,
    uploadImage,
    deleteImage,
    reset,
    validate,
  }
}
