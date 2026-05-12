import { getCategoryLabel } from '../../lib/utils'

export function CategoryBadge({ category }: { category: string }) {
  if (category === 'premium') return <span className="badge-premium">⭐ Premium</span>
  if (category === 'mid-range') return <span className="badge-mid">🔵 Médio</span>
  return <span className="badge-economy">🟢 Econômico</span>
}
