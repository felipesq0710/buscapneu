import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastCtx {
  toast: (message: string, type?: Toast['type']) => void
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36)
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 48 }}
              className="flex items-center gap-3 rounded-xl border bg-[var(--surface)] px-4 py-3 shadow-lg min-w-[280px] max-w-sm"
            >
              {t.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
              {t.type === 'error' && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}
              {t.type === 'info' && <Info className="h-4 w-4 text-blue-500 shrink-0" />}
              <p className="flex-1 text-sm text-[var(--text)]">{t.message}</p>
              <button onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
