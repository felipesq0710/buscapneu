import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, List, Plus, GitCompare, BarChart3,
  LogOut, Sun, Moon, Menu, X, Gauge
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/auth.store'
import { useThemeStore } from '../../store/theme.store'
import { cn } from '../../lib/utils'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/quotes', label: 'Cotações', icon: List },
  { to: '/quotes/new', label: 'Nova Cotação', icon: Plus },
  { to: '/compare', label: 'Comparar', icon: GitCompare },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { dark, toggle } = useThemeStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
      {/* Sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-[var(--surface)] md:flex">
        <SidebarContent nav={nav} user={user} dark={dark} toggle={toggle} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-[var(--surface)] md:hidden"
      >
        <SidebarContent nav={nav} user={user} dark={dark} toggle={toggle} onLogout={handleLogout} onClose={() => setMobileOpen(false)} />
      </motion.aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="flex h-14 items-center justify-between border-b bg-[var(--surface)] px-4 md:hidden">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-[var(--accent)]" />
            <span className="font-bold text-[var(--text)]">BuscaPneu</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-[var(--surface-2)]">
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  nav, user, dark, toggle, onLogout, onClose
}: {
  nav: typeof import('./Layout').default extends never ? never : { to: string; label: string; icon: React.ElementType; end?: boolean }[]
  user: import('../../types').User | null
  dark: boolean
  toggle: () => void
  onLogout: () => void
  onClose?: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-5">
        <NavLink to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
            <Gauge className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none text-[var(--text)]">BuscaPneu</p>
            <p className="text-[10px] text-[var(--text-muted)]">Plataforma de cotações</p>
          </div>
        </NavLink>
        {onClose && (
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-[var(--surface-2)]">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-auto p-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all',
              isActive
                ? 'bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t p-3 space-y-1">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-all"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {dark ? 'Modo claro' : 'Modo escuro'}
        </button>
        <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)]/20 text-xs font-semibold text-[var(--accent)]">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-[var(--text)]">{user?.name}</p>
            <p className="truncate text-[10px] text-[var(--text-muted)]">{user?.email}</p>
          </div>
          <button onClick={onLogout} className="rounded-lg p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
