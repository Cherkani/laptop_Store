import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

async function fetchActivityData() {
  const since = new Date()
  since.setFullYear(since.getFullYear() - 1)
  const sinceISO = since.toISOString()

  const { data, error } = await supabase
    .from('products')
    .select('created_at')
    .gte('created_at', sinceISO)

  if (error) throw error
  return (data ?? []) as { created_at: string }[]
}

function toDateKey(iso: string) {
  return iso.slice(0, 10)
}

function buildGrid() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay()

  const start = new Date(today)
  start.setDate(start.getDate() - dayOfWeek - 52 * 7)

  const weeks: Date[][] = []
  const cursor = new Date(start)

  while (cursor <= today) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

function getLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (max === 0) return 1
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

export function ActivityHeatmap() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin', 'activity-heatmap'],
    queryFn: fetchActivityData,
    staleTime: 5 * 60 * 1000,
  })

  const weeks = useMemo(() => buildGrid(), [])

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    products.forEach(p => {
      const k = toDateKey(p.created_at)
      map[k] = (map[k] ?? 0) + 1
    })
    return map
  }, [products])

  const maxCount = Math.max(...Object.values(counts), 1)

  const monthLabels: { label: string; col: number }[] = []
  weeks.forEach((week, col) => {
    const first = week.find(d => d.getDate() <= 7)
    if (first) {
      const prev = col > 0 ? weeks[col - 1][0] : null
      if (!prev || prev.getMonth() !== first.getMonth()) {
        monthLabels.push({ label: MONTH_LABELS[first.getMonth()], col })
      }
    }
  })

  if (isLoading) {
    return <div className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm p-5 h-40 animate-pulse" />
  }

  return (
    <div className="bg-surface-raised rounded-2xl border border-border-faint shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-on-surface">Activité catalogue</p>
        <span className="text-xs font-medium text-on-surface-faint">{products.length} produits ajoutés (12 mois)</span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: weeks.length * 13 }}>
          <div className="flex mb-1" style={{ paddingLeft: 20 }}>
            {weeks.map((_, col) => {
              const ml = monthLabels.find(m => m.col === col)
              return (
                <div key={col} className="shrink-0" style={{ width: 11, marginRight: 2 }}>
                  {ml && <span className="text-[10px] text-on-surface-faint whitespace-nowrap">{ml.label}</span>}
                </div>
              )
            })}
          </div>

          <div className="flex gap-[2px]">
            <div className="flex flex-col gap-[2px] mr-1 shrink-0">
              {['', 'Lun', '', 'Mer', '', 'Ven', ''].map((d, i) => (
                <div key={i} className="h-[11px] text-[9px] text-on-surface-faint flex items-center" style={{ width: 16 }}>
                  {d}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => {
                  const key = toDateKey(day.toISOString())
                  const count = counts[key] ?? 0
                  const level = getLevel(count, maxCount)
                  const isFuture = day > new Date()
                  const title = isFuture
                    ? ''
                    : count === 0
                    ? `${day.toLocaleDateString('fr-FR')} — aucun ajout`
                    : `${day.toLocaleDateString('fr-FR')} — ${count} produit${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''}`
                  return (
                    <div
                      key={di}
                      title={title}
                      className={cn(
                        'rounded-[2px] shrink-0',
                        isFuture
                          ? 'bg-surface-sunken opacity-50'
                          : ({ 0: 'bg-surface-sunken', 1: 'bg-cyan-200', 2: 'bg-cyan-400', 3: 'bg-cyan-500', 4: 'bg-cyan-700' }[level]),
                      )}
                      style={{ width: 11, height: 11 }}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-on-surface-faint">Moins</span>
            {([0, 1, 2, 3, 4] as const).map(l => (
              <div
                key={l}
                className={cn('rounded-[2px]', { 0: 'bg-surface-sunken', 1: 'bg-cyan-200', 2: 'bg-cyan-400', 3: 'bg-cyan-500', 4: 'bg-cyan-700' }[l])}
                style={{ width: 11, height: 11 }}
              />
            ))}
            <span className="text-[10px] text-on-surface-faint">Plus</span>
          </div>
        </div>
      </div>
    </div>
  )
}
