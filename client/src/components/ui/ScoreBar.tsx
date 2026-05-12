import { getScoreColor, getScoreBg } from '../../lib/utils'
import { cn } from '../../lib/utils'

export function ScoreBar({ score, size = 'sm' }: { score: number; size?: 'sm' | 'md' }) {
  return (
    <div className={cn('flex items-center gap-2', size === 'md' && 'flex-col items-start')}>
      <span className={cn('font-mono font-semibold', getScoreColor(score), size === 'md' ? 'text-2xl' : 'text-sm')}>
        {score}
      </span>
      <div className={cn('flex-1 rounded-full bg-[var(--surface-2)]', size === 'md' ? 'h-2 w-full' : 'h-1.5 w-16')}>
        <div
          className={cn('h-full rounded-full transition-all', getScoreBg(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
