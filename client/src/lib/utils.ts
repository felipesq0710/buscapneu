import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value?: number | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(value))
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-500'
  if (score >= 55) return 'text-amber-500'
  return 'text-red-500'
}

export function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500'
  if (score >= 55) return 'bg-amber-500'
  return 'bg-red-500'
}

export function getCategoryLabel(cat: string): string {
  if (cat === 'premium') return 'Premium'
  if (cat === 'mid-range') return 'Médio'
  return 'Econômico'
}
