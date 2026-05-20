// Reusable skeleton primitives untuk loading state.
// Pakai animasi shimmer halus, warna konsisten dengan canvas-parchment.

const baseStyle = {
  background:
    'linear-gradient(90deg, #f0f0f0 0%, #f7f7f8 50%, #f0f0f0 100%)',
  backgroundSize: '200% 100%',
  animation: 'zen-skeleton-shimmer 1.4s ease-in-out infinite',
  borderRadius: 6,
}

function Stylesheet() {
  return (
    <style>{`
      @keyframes zen-skeleton-shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  )
}

export function Skeleton({
  width = '100%',
  height = 14,
  rounded = 6,
  style,
  className,
}) {
  return (
    <>
      <Stylesheet />
      <span
        aria-hidden="true"
        className={className}
        style={{
          display: 'block',
          width,
          height,
          borderRadius: rounded,
          ...baseStyle,
          ...style,
        }}
      />
    </>
  )
}

export function SkeletonText({ lines = 3, gap = 8, lastWidth = '60%', style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? lastWidth : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonRect({ height = 200, rounded = 11, style }) {
  return <Skeleton height={height} rounded={rounded} style={style} />
}

export function SkeletonCircle({ size = 48 }) {
  return <Skeleton width={size} height={size} rounded={9999} />
}

export default Skeleton
