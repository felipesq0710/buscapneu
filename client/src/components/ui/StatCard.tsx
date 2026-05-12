import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  sub?: string
  accent?: boolean
  delay?: number
}

export function StatCard({ label, value, icon, sub, accent, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={cn(
        'card hover:shadow-md',
        accent && 'border-[var(--accent)]/40 bg-gradient-to-br from-[var(--accent)]/5 to-transparent'
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          accent ? 'bg-[var(--accent)]/15 text-[var(--accent)]' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
        )}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-[var(--text-muted)]">{label}</p>
        {sub && <p className="mt-1 text-xs text-[var(--text-muted)]">{sub}</p>}
      </div>
    </motion.div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="mt-4 space-y-2">
        <div className="skeleton h-7 w-28" />
        <div className="skeleton h-4 w-20" />
      </div>
    </div>
  )
}
