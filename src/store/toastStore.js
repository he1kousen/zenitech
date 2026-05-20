import { create } from 'zustand'

let counter = 0
const nextId = () => `t-${++counter}-${Date.now()}`

const DEFAULT_DURATION = 3500

export const useToastStore = create((set, get) => ({
  toasts: [],

  push: ({ message, kind = 'info', duration = DEFAULT_DURATION }) => {
    if (!message) return null
    const id = nextId()
    set((state) => ({ toasts: [...state.toasts, { id, message, kind }] }))
    if (duration > 0) {
      setTimeout(() => get().dismiss(id), duration)
    }
    return id
  },

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  clear: () => set({ toasts: [] }),
}))

// API ringan supaya pemakaian cukup `toast.success(...)` di komponen.
export const toast = {
  success: (message, opts = {}) =>
    useToastStore.getState().push({ ...opts, message, kind: 'success' }),
  error: (message, opts = {}) =>
    useToastStore.getState().push({ ...opts, message, kind: 'error' }),
  info: (message, opts = {}) =>
    useToastStore.getState().push({ ...opts, message, kind: 'info' }),
}
