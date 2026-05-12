import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Plus, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Trash2, GitCompare } from 'lucide-react'
import api from '../lib/api'
import type { TireQuote, QuoteFilters } from '../types'
import { formatCurrency, formatDate } from '../lib/utils'
import { ScoreBar } from '../components/ui/ScoreBar'
import { CategoryBadge } from '../components/ui/CategoryBadge'
import { useToast } from '../components/ui/Toast'

export default function Quotes() {
  const [quotes, setQuotes] = useState<TireQuote[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [filters, setFilters] = useState<QuoteFilters>({ page: 1, limit: 15, sortBy: 'createdAt', sortOrder: 'desc' })
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, any> = { ...filters, search: search || undefined }
      const { data } = await api.get('/quotes', { params })
      setQuotes(data.quotes)
      setTotal(data.pagination.total)
      setPages(data.pagination.pages)
    } catch {
      toast('Erro ao carregar cotações', 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, search])

  useEffect(() => { load() }, [load])

  function handleSort(field: string) {
    setFilters(f => ({
      ...f,
      sortBy: field,
      sortOrder: f.sortBy === field && f.sortOrder === 'desc' ? 'asc' : 'desc',
      page: 1,
    }))
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover esta cotação?')) return
    try {
      await api.delete(`/quotes/${id}`)
      toast('Cotação removida', 'success')
      load()
    } catch {
      toast('Erro ao remover', 'error')
    }
  }

  function toggleSelect(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : s.length < 3 ? [...s, id] : s)
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sortBy !== field) return null
    return filters.sortOrder === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Cotações</h1>
          <p className="text-sm text-[var(--text-muted)]">{total} cotações encontradas</p>
        </div>
        <div className="flex gap-2">
          {selected.length >= 2 && (
            <Link to={`/compare?ids=${selected.join(',')}`} className="btn-secondary">
              <GitCompare className="h-4 w-4" />
              Comparar ({selected.length})
            </Link>
          )}
          <Link to="/quotes/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Nova
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              className="input pl-9"
              placeholder="Buscar marca, empresa..."
              value={search}
              onChange={e => { setSearch(e.target.value); setFilters(f => ({ ...f, page: 1 })) }}
            />
          </div>
          <select className="input w-auto min-w-[140px]" value={filters.category || ''} onChange={e => setFilters(f => ({ ...f, category: e.target.value || undefined, page: 1 }))}>
            <option value="">Todas categorias</option>
            <option value="premium">Premium</option>
            <option value="mid-range">Médio</option>
            <option value="economy">Econômico</option>
          </select>
          <select className="input w-auto min-w-[140px]" value={filters.sortBy} onChange={e => setFilters(f => ({ ...f, sortBy: e.target.value, page: 1 }))}>
            <option value="createdAt">Mais recentes</option>
            <option value="unitPrice">Menor preço</option>
            <option value="score">Melhor score</option>
            <option value="company">Empresa</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
            <input type="checkbox" className="rounded" checked={!!filters.hasInstallment} onChange={e => setFilters(f => ({ ...f, hasInstallment: e.target.checked, page: 1 }))} />
            Parcelamento
          </label>
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
            <input type="checkbox" className="rounded" checked={!!filters.hasServices} onChange={e => setFilters(f => ({ ...f, hasServices: e.target.checked, page: 1 }))} />
            Serviços inclusos
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-[var(--surface-2)]">
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" className="rounded" onChange={e => setSelected(e.target.checked ? quotes.slice(0, 3).map(q => q.id) : [])} />
                </th>
                {[
                  { label: 'Empresa', field: 'company' },
                  { label: 'Marca/Modelo', field: 'brand' },
                  { label: 'Categoria', field: 'category' },
                  { label: 'Preço unitário', field: 'unitPrice' },
                  { label: '2 pneus', field: 'totalPrice' },
                  { label: 'Pagamento', field: null },
                  { label: 'Score', field: 'score' },
                  { label: 'Data', field: 'createdAt' },
                  { label: '', field: null },
                ].map(col => (
                  <th
                    key={col.label}
                    className="px-4 py-3 text-left font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider whitespace-nowrap"
                    onClick={() => col.field && handleSort(col.field)}
                    style={{ cursor: col.field ? 'pointer' : 'default' }}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.field && <SortIcon field={col.field} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-[var(--text-muted)]">Nenhuma cotação encontrada</p>
                    <Link to="/quotes/new" className="mt-3 inline-flex btn-primary text-xs">Adicionar cotação</Link>
                  </td>
                </tr>
              ) : quotes.map((q, i) => (
                <motion.tr
                  key={q.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b hover:bg-[var(--surface-2)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded" checked={selected.includes(q.id)} onChange={() => toggleSelect(q.id)} />
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{q.company}</td>
                  <td className="px-4 py-3 text-[var(--text)] whitespace-nowrap">
                    <div className="font-medium">{q.brand}</div>
                    {q.model && <div className="text-xs text-[var(--text-muted)]">{q.model}</div>}
                  </td>
                  <td className="px-4 py-3"><CategoryBadge category={q.category} /></td>
                  <td className="px-4 py-3 font-mono font-semibold text-[var(--text)]">{formatCurrency(q.unitPrice)}</td>
                  <td className="px-4 py-3 font-mono text-[var(--text-muted)]">{formatCurrency(q.totalPrice)}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] max-w-[160px]">
                    <span className="block truncate text-xs">{q.paymentConditions || '—'}</span>
                  </td>
                  <td className="px-4 py-3"><ScoreBar score={q.score} /></td>
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">{formatDate(q.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(q.id)} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-[var(--text-muted)]">
              Página {filters.page} de {pages} · {total} itens
            </p>
            <div className="flex gap-1">
              <button className="btn-secondary px-2 py-1.5 text-xs" disabled={(filters.page ?? 1) <= 1} onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) - 1 }))}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button className="btn-secondary px-2 py-1.5 text-xs" disabled={(filters.page ?? 1) >= pages} onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
