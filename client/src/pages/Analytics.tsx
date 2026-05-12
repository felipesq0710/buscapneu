import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts'
import api from '../lib/api'
import type { BrandPrice, CompanyRanking, PriceDistribution } from '../types'
import { formatCurrency } from '../lib/utils'

const PALETTE = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16']

export default function Analytics() {
  const [brandData, setBrandData] = useState<BrandPrice[]>([])
  const [ranking, setRanking] = useState<CompanyRanking[]>([])
  const [dist, setDist] = useState<PriceDistribution | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/price-by-brand'),
      api.get('/analytics/company-ranking'),
      api.get('/analytics/price-distribution'),
    ]).then(([b, r, d]) => {
      setBrandData(b.data)
      setRanking(r.data)
      setDist(d.data)
    }).finally(() => setLoading(false))
  }, [])

  const tooltipStyle = {
    contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 },
    labelStyle: { color: 'var(--text)', fontWeight: 600 },
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Analytics</h1>
        <p className="text-sm text-[var(--text-muted)]">Análise detalhada do mercado de pneus</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Price by brand */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card">
          <h2 className="mb-1 text-sm font-semibold text-[var(--text)]">Preço médio por marca</h2>
          <p className="mb-4 text-xs text-[var(--text-muted)]">Média dos preços unitários por fabricante</p>
          {loading ? <div className="skeleton h-60 w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={brandData} layout="vertical" margin={{ left: 20, right: 20, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `R$${v}`} />
                <YAxis type="category" dataKey="brand" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={75} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [formatCurrency(v), 'Preço médio']} />
                <Bar dataKey="avgPrice" radius={[0, 6, 6, 0]}>
                  {brandData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Company ranking */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h2 className="mb-1 text-sm font-semibold text-[var(--text)]">Ranking de empresas por score</h2>
          <p className="mb-4 text-xs text-[var(--text-muted)]">Score médio de custo-benefício</p>
          {loading ? <div className="skeleton h-60 w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ranking.slice(0, 8)} margin={{ top: 0, right: 0, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="company" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={[0, 100]} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [v + '/100', 'Score médio']} />
                <Bar dataKey="avgScore" fill="#f97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Price distribution */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
          <h2 className="mb-1 text-sm font-semibold text-[var(--text)]">Distribuição de preços</h2>
          <p className="mb-4 text-xs text-[var(--text-muted)]">Quantidade de pneus por faixa de preço</p>
          {loading || !dist ? <div className="skeleton h-60 w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dist.distribution} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} allowDecimals={false} />
                <Tooltip {...tooltipStyle} formatter={(v: number) => [v + ' pneus', 'Quantidade']} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Premium vs Economy pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 className="mb-1 text-sm font-semibold text-[var(--text)]">Premium vs Econômico</h2>
          <p className="mb-4 text-xs text-[var(--text-muted)]">Distribuição por segmento de mercado</p>
          {loading || !dist ? <div className="skeleton h-60 w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={dist.premiumVsEconomy} cx="50%" cy="50%" outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {dist.premiumVsEconomy.map((_, i) => <Cell key={i} fill={['#8b5cf6', '#3b82f6', '#10b981'][i]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Company price comparison */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card lg:col-span-2">
          <h2 className="mb-1 text-sm font-semibold text-[var(--text)]">Score vs Preço médio por empresa</h2>
          <p className="mb-4 text-xs text-[var(--text-muted)]">Relação entre custo-benefício e preço praticado</p>
          {loading ? <div className="skeleton h-60 w-full rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={ranking.filter(r => r.avgPrice)} margin={{ top: 0, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="company" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} angle={-30} textAnchor="end" />
                <YAxis yAxisId="left" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => `R$${v}`} />
                <Tooltip {...tooltipStyle} formatter={(v: number, n: string) => [n === 'avgScore' ? v + '/100' : formatCurrency(v), n === 'avgScore' ? 'Score' : 'Preço médio']} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avgScore" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} name="Score" />
                <Line yAxisId="right" type="monotone" dataKey="avgPrice" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Preço médio" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Company table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-sm font-semibold text-[var(--text)]">Tabela de desempenho por empresa</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-[var(--surface-2)]">
                {['#', 'Empresa', 'Cotações', 'Score médio', 'Preço médio', 'Avaliação'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b">
                  {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-5 py-3"><div className="skeleton h-4 w-full" /></td>)}
                </tr>
              )) : ranking.map((r, i) => (
                <tr key={r.company} className="border-b hover:bg-[var(--surface-2)] transition-colors">
                  <td className="px-5 py-3 text-xs font-mono text-[var(--text-muted)]">{i + 1}</td>
                  <td className="px-5 py-3 font-semibold text-[var(--text)]">{r.company}</td>
                  <td className="px-5 py-3 text-[var(--text-muted)]">{r.quoteCount}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[var(--surface-2)]">
                        <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${r.avgScore}%` }} />
                      </div>
                      <span className="font-mono text-xs font-semibold text-[var(--text)]">{r.avgScore}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-[var(--text)]">{formatCurrency(r.avgPrice)}</td>
                  <td className="px-5 py-3 text-xs">
                    {r.avgScore >= 70 ? <span className="text-emerald-500 font-medium">✅ Excelente</span>
                    : r.avgScore >= 55 ? <span className="text-amber-500 font-medium">⚡ Bom</span>
                    : <span className="text-red-500 font-medium">⚠️ Regular</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
