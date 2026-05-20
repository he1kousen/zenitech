// Midtrans Snap helper
// Loads snap.js (sandbox) sekali, lalu expose openPayment().
// Server key TIDAK pernah ada di sini — cuma client key publik.

const MIDTRANS_SNAP_SCRIPT = 'https://app.sandbox.midtrans.com/snap/snap.js'
const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY

let loadPromise = null

// Load script Midtrans Snap. Hanya inject sekali; panggilan berikutnya
// re-use promise yang sama. Resolve setelah window.snap tersedia.
export function loadMidtransSnap() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('loadMidtransSnap dipanggil di server'))
  }

  if (window.snap) return Promise.resolve(window.snap)
  if (loadPromise) return loadPromise

  if (!clientKey) {
    return Promise.reject(
      new Error(
        'VITE_MIDTRANS_CLIENT_KEY belum di-set di .env. Restart `npm run dev` setelah menambahkannya.'
      )
    )
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${MIDTRANS_SNAP_SCRIPT}"]`
    )
    if (existing) {
      const onReady = () => {
        if (window.snap) resolve(window.snap)
        else reject(new Error('Snap script ter-load tapi window.snap kosong'))
      }
      if (window.snap) onReady()
      else existing.addEventListener('load', onReady, { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = MIDTRANS_SNAP_SCRIPT
    script.setAttribute('data-client-key', clientKey)
    script.async = true
    script.onload = () => {
      if (window.snap) resolve(window.snap)
      else reject(new Error('Snap script ter-load tapi window.snap kosong'))
    }
    script.onerror = () =>
      reject(new Error('Gagal load script Midtrans Snap'))
    document.body.appendChild(script)
  })

  return loadPromise
}

// Open Midtrans Snap popup.
// Pastikan loadMidtransSnap() sudah resolve sebelum memanggil ini.
export function openPayment(token, { onSuccess, onPending, onError, onClose } = {}) {
  if (!window.snap) {
    throw new Error('Midtrans Snap belum siap. Panggil loadMidtransSnap() dulu.')
  }
  if (!token) {
    throw new Error('Token Midtrans kosong')
  }
  window.snap.pay(token, {
    onSuccess: (result) => onSuccess && onSuccess(result),
    onPending: (result) => onPending && onPending(result),
    onError: (result) => onError && onError(result),
    onClose: () => onClose && onClose(),
  })
}
