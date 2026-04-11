import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

// ── Data fetching ────────────────────────────────────────────────

async function fetchActivityData() {
  const since = new Date()
  since.setFullYear(since.getFullYear() - 1)
  const sinceISO = since.toISOString()

  const [productsRes, salesRes] = await Promise.all([
    supabase
      .from('products')
      .select('created_at')
      .gte('created_at', sinceISO),
    supabase
      .from('sales_records')
      .select('created_at, status')
      .gte('created_at', sinceISO)
      .in('status', ['sold', 'paid', 'invoiced', 'delivery']),
  ])

  if (productsRes.error) throw productsRes.error
  if (salesRes.error) throw salesRes.error

  return {
    products: (productsRes.data ?? []) as { created_at: string }[],
    sales: (salesRes.data ?? []) as { created_at: string; status: string }[],
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function toDateKey(iso: string) {
  return iso.slice(0, 10) // 'YYYY-MM-DD'
}

function buildGrid() {
  // Build 53 weeks × 7 days ending today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay() // 0=Sun

  // Start from the Sunday 52 weeks ago
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

// ── Sub-component ────────────────────────────────────────────────

interface HeatmapGridProps {
  counts: Record<string, number>
  label: string
  colorClass: (level: 0 | 1 | 2 | 3 | 4) => string
  tooltip: (date: Date, count: number) => string
  weeks: Date[][]
  totalLabel: string
  total: number
}

function HeatmapGrid({ counts, label, colorClass, tooltip, weeks, totalLabel, total }: HeatmapGridProps) {
  const maxCount = Math.max(...Object.values(counts), 1)

  // Month label positions
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

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <span className="text-xs font-medium text-slate-400">{total} {totalLabel}</span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: weeks.length * 13 }}>
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: 20 }}>
            {weeks.map((_, col) => {
              const ml = monthLabels.find(m => m.col === col)
              return (
                <div key={col} className="shrink-0" style={{ width: 11, marginRight: 2 }}>
                  {ml && (
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{ml.label}</span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Grid */}
          <div className="flex gap-[2px]">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1 shrink-0">
              {['', 'Lun', '', 'Mer', '', 'Ven', ''].map((d, i) => (
                <div key={i} className="h-[11px] text-[9px] text-slate-300 flex items-center" style={{ width: 16 }}>
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
                  return (
                    <div
                      key={di}
                      title={isFuture ? '' : tooltip(day, count)}
                      className={cn(
                        'rounded-[2px] shrink-0',
                        isFuture ? 'bg-slate-50' : colorClass(level),
                      )}
                      style={{ width: 11, height: 11 }}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-end">
            <span className="text-[10px] text-slate-400">Moins</span>
            {([0, 1, 2, 3, 4] as const).map(l => (
              <div key={l} className={cn('rounded-[2px]', colorClass(l))} style={{ width: 11, height: 11 }} />
            ))}
            <span className="text-[10px] text-slate-400">Plus</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────

export function ActivityHeatmap() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'activity-heatmap'],
    queryFn: fetchActivityData,
    staleTime: 5 * 60 * 1000,
  })

  const weeks = useMemo(() => buildGrid(), [])

  const catalogueCounts = useMemo(() => {
    const map: Record<string, number> = {}
    data?.products.forEach(p => {
      const k = toDateKey(p.created_at)
      map[k] = (map[k] ?? 0) + 1
    })
    return map
  }, [data])

  const salesCounts = useMemo(() => {
    const map: Record<string, number> = {}
    data?.sales.forEach(s => {
      const k = toDateKey(s.created_at)
      map[k] = (map[k] ?? 0) + 1
    })
    return map
  }, [data])

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-5">
        {[0, 1].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-40 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 gap-5">
      <HeatmapGrid
        weeks={weeks}
        label="Activité catalogue"
        totalLabel="produits ajoutés (12 mois)"
        total={data?.products.length ?? 0}
        counts={catalogueCounts}
        colorClass={level => ({
          0: 'bg-slate-100',
          1: 'bg-cyan-200',
          2: 'bg-cyan-400',
          3: 'bg-cyan-500',
          4: 'bg-cyan-700',
        }[level])}
        tooltip={(date, count) =>
          count === 0
            ? `${date.toLocaleDateString('fr-FR')} — aucun ajout`
            : `${date.toLocaleDateString('fr-FR')} — ${count} produit${count > 1 ? 's' : ''} ajouté${count > 1 ? 's' : ''}`
        }
      />

      <HeatmapGrid
        weeks={weeks}
        label="Activité ventes"
        totalLabel="ventes (12 mois)"
        total={data?.sales.length ?? 0}
        counts={salesCounts}
        colorClass={level => ({
          0: 'bg-slate-100',
          1: 'bg-emerald-200',
          2: 'bg-emerald-400',
          3: 'bg-emerald-500',
          4: 'bg-emerald-700',
        }[level])}
        tooltip={(date, count) =>
          count === 0
            ? `${date.toLocaleDateString('fr-FR')} — aucune vente`
            : `${date.toLocaleDateString('fr-FR')} — ${count} vente${count > 1 ? 's' : ''}`
        }
      />
    </div>
  )
}
