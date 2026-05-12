import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitCompare, Check, X } from 'lucide-react'
import api from '../lib/api'
import type { TireQuote } from '../types'
import { formatCurrency, getScoreColor, getScoreBg } from '../lib/utils'
import { CategoryBadge } from '../components/ui/CategoryBadge'

function servicesList(s?: string | null): string[] {
  if (!s || s === 'Não incluso' || s === 'Não informado') return []
  return s.split(/[+,]/).map(x => x.trim()).filter(Boolean)
}

function ScoreCircle({ score }: { score: number }) {
  const r = 32, c = 2 * Math.PI * r
  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="6" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} strokeLinecap="round" className={getScoreColor(score).replace('text-', 'stroke-')} style={{ stroke: score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444' }} />
      </svg>
      <span className={`font-mono text-xl font-bold ${getScoreColor(score)}`}>{score}</span>
    </div>
  )
}

export default function Compare() {
  const [params] = useSearchParams()
  const ids = params.get('ids')?.split(',').filter(Boolean) || []
  const [quotes, setQuotes] = useState<TireQuote[]>([])
  const [allQuotes, setAllQuotes] = useState<TireQuote[]>([])
  const [selected, setSelected] = useState<string[]>(ids)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/quotes', { params: { limit: 100 } }).then(r => setAllQuotes(r.data.quotes))
  }, [])

  useEffect(() => {
    if (selected.length < 2) return
    setLoading(true)
    api.post('/quotes/compare', { ids: selected })
      .then(r => setQuotes(r.data))
      .finally(() => setLoading(false))
  }, [selected])

  function toggleQuote(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : s.length < 3 ? [...s, id] : s)
  }

  const best = quotes.length ? quotes.reduce((a, b) => a.score > b.score ? a : b) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Comparador</h1>
        <p className="text-sm text-[var(--text-muted)]">Selecione até 3 cotações para comparar lado a lado</p>
      </div>

      {/* Selector */}
      <div className="card">
        <p className="mb-3 text-sm font-semibold text-[var(--text)]">Selecionar cotações ({selected.length}/3)</p>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {allQuotes.map(q => (
            <button
              key={q.id}
              onClick={() => toggleQuote(q.id)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                selected.includes(q.id)
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50'
              }`}
            >
              {q.brand} — {q.company}
            </button>
          ))}
        </div>
      </div>

      {/* Compare cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: selected.length }).map((_, i) => (
            <div key={i} className="card space-y-4">
              <div className="skeleton h-6 w-3/4" />
              <div className="skeleton h-10 w-10 rounded-full" />
              {Array.from({ length: 5 }).map((_, j) => <div key={j} className="skeleton h-4 w-full" />)}
            </div>
          ))}
        </div>
      ) : quotes.length >= 2 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {quotes.map((q, i) => {
            const isBest = q.id === best?.id
            const services = servicesList(q.includedServices)
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`card relative overflow-hidden ${isBest ? 'border-[var(--accent)]/50 ring-2 ring-[var(--accent)]/20' : ''}`}
              >
                {isBest && (
                  <div className="absolute right-0 top-0 rounded-bl-xl bg-[var(--accent)] px-2.5 py-1 text-[10px] font-bold text-white">
                    🏆 Melhor
                  </div>
                )}
                <CategoryBadge category={q.category} />
                <h3 className="mt-2 text-lg font-bold text-[var(--text)]">{q.brand}</h3>
                <p className="text-sm text-[var(--text-muted)]">{q.company}</p>

                <div className="my-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-[var(--text)]">{formatCurrency(q.unitPrice)}</p>
                    <p className="text-xs text-[var(--text-muted)]">por unidade</p>
                    <p className="text-sm font-medium text-[var(--text-muted)]">{formatCurrency(q.totalPrice)} (2 pneus)</p>
                  </div>
                  <ScoreCircle score={q.score} />
                </div>

                <div className="space-y-2 border-t pt-3">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-[var(--text-muted)] w-20 shrink-0">Pagamento</span>
                    <span className="text-[var(--text)]">{q.paymentConditions || '—'}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-[var(--text-muted)] w-20 shrink-0">Serviços</span>
                    <div className="space-y-0.5">
                      {services.length > 0 ? services.map((s, j) => (
                        <div key={j} className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" /> {s}
                        </div>
                      )) : (
                        <div className="flex items-center gap-1 text-red-500">
                          <X className="h-3 w-3" /> Não inclusos
                        </div>
                      )}
                    </div>
                  </div>
                  {q.observations && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="font-semibold text-[var(--text-muted)] w-20 shrink-0">Obs.</span>
                      <span className="text-[var(--text-muted)]">{q.observations}</span>
                    </div>
                  )}
                </div>

                {/* Verdict */}
                <div className={`mt-4 rounded-xl p-3 text-xs font-medium ${isBest ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}>
                  {isBest ? '✅ Recomendado — melhor custo-benefício desta seleção' : `Score ${q.score}/100 — ${q.score < 55 ? 'custo-benefício abaixo da média' : 'custo-benefício razoável'}`}
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="card py-16 text-center">
          <GitCompare className="mx-auto h-10 w-10 text-[var(--text-muted)] mb-3" />
          <p className="text-[var(--text-muted)]">Selecione pelo menos 2 cotações acima para comparar</p>
        </div>
      )}
    </div>
  )
}
