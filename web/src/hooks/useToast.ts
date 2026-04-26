import { useState, useRef, useCallback } from 'react'

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const showToast = useCallback((msg: string) => {
    setMessage(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 4000)
  }, [])

  const clearToast = useCallback(() => setMessage(null), [])

  return { toastMessage: message, showToast, clearToast }
}
