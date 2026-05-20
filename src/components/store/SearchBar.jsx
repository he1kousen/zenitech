import { useEffect, useState } from 'react'

function SearchIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  )
}

export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Cari produk Apple...',
  debounceMs = 300,
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (localValue === value) return
    const timer = setTimeout(() => {
      onChange?.(localValue)
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [localValue, value, debounceMs, onChange])

  return (
    <div
      className="relative w-full"
      style={{ maxWidth: 480 }}
    >
      <span
        className="text-ink-muted-48 absolute"
        style={{
          left: 20,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <SearchIcon />
      </span>
      <input
        type="search"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Cari produk"
        className="text-body-base text-ink w-full"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 9999,
          padding: '12px 20px 12px 48px',
          height: 44,
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#0071e3'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'
        }}
      />
    </div>
  )
}
