import { useToastStore } from '../../store/toastStore'

const KIND_ACCENT = {
  success: '#0066cc',
  error: '#b3261e',
  info: '#7a7a7a',
}

function ToastItem({ toast, onDismiss }) {
  const accent = KIND_ACCENT[toast.kind] || KIND_ACCENT.info
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: '#1d1d1f',
        color: '#ffffff',
        borderRadius: 18,
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minWidth: 240,
        maxWidth: 'calc(100vw - 40px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        animation: 'toast-slide-in 0.18s ease-out',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: 9999,
          background: accent,
          flexShrink: 0,
        }}
      />
      <span
        className="text-body-base"
        style={{ flex: 1, color: '#ffffff', fontSize: 15 }}
      >
        {toast.message}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="active-scale"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#cccccc',
          fontSize: 18,
          cursor: 'pointer',
          padding: 4,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}

export default function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </>
  )
}
