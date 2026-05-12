import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  TrendingDown, Building2, Package, Award, Zap,
  ArrowRight, CheckCircle, AlertTriangle, Info
} from 'lucide-react'
import { StatCard, StatCardSkeleton } from '../components/ui/StatCard'
import { formatCurrency } from '../lib/utils'
import api from '../lib/api'
import type { DashboardStats, Insight } from '../types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981']

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [brandData, setBrandData] = useState<any[]>([])
  const [distData, setDistData] = useState<any>(null)
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, b, d, i] = await Promise.all([
          api.get('/analytics/stats'),
          api.get('/analytics/price-by-brand'),
          api.get('/analytics/price-distribution'),
          api.get('/analytics/insights'),
        ])
        setStats(s.data)
        setBrandData(b.data.slice(0, 8))
        setDistData(d.data)
        setInsights(i.data.insights)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Visão geral do mercado de pneus</p>
        </div>
        <Link to="/quotes/new" className="btn-primary">
          <span>Nova cotação</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Cotações" value={stats?.totalQuotes ?? 0} icon={<Package className="h-5 w-5" />} delay={0} />
            <StatCard label="Empresas" value={stats?.totalCompanies ?? 0} icon={<Building2 className="h-5 w-5" />} delay={0.05} />
            <StatCard label="Menor preço" value={formatCurrency(stats?.lowestPrice)} icon={<TrendingDown className="h-5 w-5" />} accent delay={0.1} />
            <StatCard label="Preço médio" value={formatCurrency(stats?.avgPrice)} icon={<Zap className="h-5 w-5" />} delay={0.15} />
            <StatCard label="Pneus premium" value={stats?.premiumCount ?? 0} icon={<Award className="h-5 w-5" />} delay={0.2} />
            <StatCard label="Econômicos" value={stats?.economyCount ?? 0} icon={<CheckCircle className="h-5 w-5" />} delay={0.25} />
          </>
        )}
      </div>

      {/* Best deal banner */}
      {stats?.bestDeal && (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="card border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/10 to-transparent"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/20 text-2xl">🏆</div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">Melhor custo-benefício</p>
              <p className="text-lg font-bold text-[var(--text)]">{stats.bestDeal.brand}</p>
              <p className="text-sm text-[var(--text-muted)]">{stats.bestDeal.company} — {formatCurrency(stats.bestDeal.price)}/un · Score {stats.bestDeal.score}/100</p>
            </div>
            <Link to="/compare" className="btn-secondary hidden sm:inline-flex">
              Comparar <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="card"
        >
          <h2 className="mb-4 text-sm font-semibold text-[var(--text)]">Preço médio por marca</h2>
          {loading ? (
            <div className="skeleton h-56 w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={brandData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="brand" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => `R$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}
                  labelStyle={{ color: 'var(--text)', fontWeight: 600 }}
                  formatter={(v: number) => [formatCurrency(v), 'Preço médio']}
                />
                <Bar dataKey="avgPrice" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="mb-4 text-sm font-semibold text-[var(--text)]">Distribuição por categoria</h2>
          {loading || !distData ? (
            <div className="skeleton h-56 w-full rounded-xl" />
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie data={distData.premiumVsEconomy} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {distData.premiumVsEconomy.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}
                    formatter={(v: number, n: string) => [v, n]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {distData.premiumVsEconomy.map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-xs text-[var(--text-muted)]">{d.name}</span>
                    <span className="ml-auto text-xs font-semibold text-[var(--text)]">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text)]">Insights automáticos</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {insights.map((ins, i) => (
              <div key={i} className="card flex items-start gap-3 py-4">
                {ins.type === 'success' && <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />}
                {ins.type === 'warning' && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
                {ins.type === 'info' && <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />}
                <div>
                  <p className="text-xs font-semibold text-[var(--text)]">{ins.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{ins.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
