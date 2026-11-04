import { useCallback, useRef, useState } from 'react'

export const TOAST_DURATION_MS = 4200
const EXIT_MS = 200

export function useToasts() {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), EXIT_MS)
  }, [])

  const push = useCallback(
    (tone, title, description) => {
      const id = ++nextId.current
      setToasts((prev) => [...prev.slice(-3), { id, tone, title, description, leaving: false }])
      setTimeout(() => dismiss(id), TOAST_DURATION_MS)
    },
    [dismiss],
  )

  return { toasts, push, dismiss }
}
