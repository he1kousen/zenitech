function Chip({ label, selected, disabled, onClick, sublabel }) {
  const borderColor = selected ? '#0071e3' : '#e0e0e0'
  const borderWidth = selected ? 2 : 1
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className="active-scale"
      style={{
        backgroundColor: '#ffffff',
        color: '#1d1d1f',
        fontFamily: "'SF Pro Text', system-ui, -apple-system, sans-serif",
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.43,
        letterSpacing: '-0.224px',
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: 9999,
        padding: selected ? '11px 15px' : '12px 16px',
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'border-color 0.15s ease',
      }}
    >
      <span>{label}</span>
      {sublabel && (
        <span style={{ color: disabled ? '#7a7a7a' : '#7a7a7a', fontSize: 12 }}>
          {sublabel}
        </span>
      )}
      {disabled && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#b00020',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Habis
        </span>
      )}
    </button>
  )
}

export default function VariantSelector({
  variants = [],
  selectedStorage,
  selectedColor,
  onStorageChange,
  onColorChange,
}) {
  const storageOptions = []
  const colorOptions = []
  const seenStorage = new Set()
  const seenColor = new Set()

  for (const v of variants) {
    if (v.storage && !seenStorage.has(v.storage)) {
      seenStorage.add(v.storage)
      storageOptions.push(v.storage)
    }
    if (v.color && !seenColor.has(v.color)) {
      seenColor.add(v.color)
      colorOptions.push(v.color)
    }
  }

  const isStorageDisabled = (storage) => {
    const matching = variants.filter((v) => v.storage === storage)
    if (selectedColor) {
      const filtered = matching.filter((v) => v.color === selectedColor)
      if (filtered.length === 0) return false
      return filtered.every((v) => (v.stock || 0) === 0)
    }
    if (matching.length === 0) return false
    return matching.every((v) => (v.stock || 0) === 0)
  }

  const isColorDisabled = (color) => {
    const matching = variants.filter((v) => v.color === color)
    if (selectedStorage) {
      const filtered = matching.filter((v) => v.storage === selectedStorage)
      if (filtered.length === 0) return true
      return filtered.every((v) => (v.stock || 0) === 0)
    }
    if (matching.length === 0) return false
    return matching.every((v) => (v.stock || 0) === 0)
  }

  return (
    <div className="flex flex-col" style={{ gap: 24 }}>
      {storageOptions.length > 0 && (
        <section>
          <h3
            className="text-caption-strong text-ink"
            style={{ marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Storage
          </h3>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {storageOptions.map((storage) => (
              <Chip
                key={storage}
                label={storage}
                selected={selectedStorage === storage}
                disabled={isStorageDisabled(storage)}
                onClick={() => onStorageChange?.(storage)}
              />
            ))}
          </div>
        </section>
      )}

      {colorOptions.length > 0 && (
        <section>
          <h3
            className="text-caption-strong text-ink"
            style={{ marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            Warna
          </h3>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {colorOptions.map((color) => (
              <Chip
                key={color}
                label={color}
                selected={selectedColor === color}
                disabled={isColorDisabled(color)}
                onClick={() => onColorChange?.(color)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
