import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  dark: boolean
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const next = !get().dark
        set({ dark: next })
        if (next) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      },
    }),
    { name: 'buscapneu_theme' },
  ),
)

// Apply on load
const stored = JSON.parse(localStorage.getItem('buscapneu_theme') || '{}')
if (stored?.state?.dark) document.documentElement.classList.add('dark')
