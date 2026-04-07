import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductFilters } from '../types'
import {
  BRANDS,
  OPERATING_SYSTEMS,
  PROCESSORS,
  RAM_OPTIONS,
  STORAGE_OPTIONS,
  GRAPHICS_OPTIONS,
  SCREEN_SIZES,
  DEFAULT_FILTERS,
} from '../types'

interface FilterSidebarProps {
  filters: ProductFilters
  onToggle: (
    key:
      | 'brands'
      | 'operatingSystems'
      | 'processors'
      | 'rams'
      | 'storages'
      | 'graphicsCards'
      | 'screenSizes',
    value: string,
  ) => void
  onFilterChange: (updates: Partial<ProductFilters>) => void
  onClear: () => void
  activeFilterCount: number
  className?: string
}

function FilterSection({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-[11px] font-semibold text-on-surface-subtle uppercase tracking-wider">
        {title}
      </h3>
      {hint && <p className="text-[11px] text-on-surface-faint">{hint}</p>}
      {children}
    </div>
  )
}

function CheckboxGroup({
  items,
  selected,
  onToggle,
}: {
  items: string[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
      {items.map(item => (
        <label
          key={item}
          className={cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors',
            selected.includes(item)
              ? 'bg-amber-500/15 text-on-surface'
              : 'hover:bg-muted/50 text-on-surface-muted',
          )}
        >
          <Checkbox
            id={item}
            checked={selected.includes(item)}
            onCheckedChange={() => onToggle(item)}
            className="rounded"
          />
          <span
            className={cn(
              'text-sm',
              selected.includes(item) ? 'font-medium' : 'font-normal',
            )}
          >
            {item}
          </span>
        </label>
      ))}
    </div>
  )
}

export function FilterSidebar({
  filters,
  onToggle,
  onFilterChange,
  onClear,
  activeFilterCount,
  className,
}: FilterSidebarProps) {
  return (
    <aside className={cn('space-y-6 text-on-surface', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <SlidersHorizontal className="h-3.5 w-3.5 text-on-surface-muted" />
          </div>
          <span className="font-bold text-on-surface">Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-on-surface text-[10px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-on-surface-subtle hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <div className="h-px bg-muted" />

      {/* Operating System */}
      <FilterSection title="Système d'exploitation">
        <div className="space-y-1">
          {OPERATING_SYSTEMS.map(os => (
            <label
              key={os}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors',
                filters.operatingSystems.includes(os)
                  ? 'bg-amber-500/15 text-on-surface'
                  : 'hover:bg-muted/50 text-on-surface-muted',
              )}
            >
              <Checkbox
                id={os}
                checked={filters.operatingSystems.includes(os)}
                onCheckedChange={() => onToggle('operatingSystems', os)}
                className="rounded"
              />
              <span
                className={cn(
                  'text-sm font-medium flex items-center gap-2',
                  filters.operatingSystems.includes(os) ? 'text-on-surface' : 'text-on-surface-muted',
                )}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-on-surface text-[10px] font-bold">
                  {os === 'macOS' ? '' : 'Win'}
                </span>
                {os}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-muted" />

      {/* Price Range */}
      <FilterSection title="Tranche de prix">
        <div className="space-y-4 px-1">
          <Slider
            min={0}
            max={DEFAULT_FILTERS.priceRange[1]}
            step={50}
            value={filters.priceRange}
            onValueChange={value =>
              onFilterChange({ priceRange: value as [number, number] })
            }
            defaultValue={[0, DEFAULT_FILTERS.priceRange[1]]}
          />
          <div className="flex justify-between text-xs font-medium text-on-surface-subtle">
            <span className="px-2 py-0.5 rounded-md bg-muted/50 border border-border-subtle">
              {formatPrice(filters.priceRange[0])}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-muted/50 border border-border-subtle">
              {formatPrice(filters.priceRange[1])}
            </span>
          </div>
        </div>
      </FilterSection>

      <div className="h-px bg-muted" />

      {/* In Stock */}
      <label className="flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
        <Checkbox
          id="inStock"
          checked={filters.inStockOnly}
          onCheckedChange={checked =>
            onFilterChange({ inStockOnly: !!checked })
          }
          className="rounded"
        />
        <Label
          htmlFor="inStock"
          className="text-sm cursor-pointer font-medium text-on-surface"
        >
          In Stock Only
        </Label>
      </label>

      <div className="h-px bg-muted" />

      {/* Brand */}
      <FilterSection title="Marque">
        <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-hide">
          {BRANDS.map(brand => (
            <label
              key={brand}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors',
                filters.brands.includes(brand)
                  ? 'bg-amber-500/15 text-on-surface'
                  : 'hover:bg-muted/50 text-on-surface-muted',
              )}
            >
              <Checkbox
                id={brand}
                checked={filters.brands.includes(brand)}
                onCheckedChange={() => onToggle('brands', brand)}
                className="rounded"
              />
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200 text-[11px] font-bold text-gray-700">
                {brand === 'Apple' ? '' : brand.substring(0, 2).toUpperCase()}
              </span>
              <span
                className={cn(
                  'text-sm',
                  filters.brands.includes(brand) ? 'font-semibold text-[#0f172a]' : 'font-normal text-on-surface-muted',
                )}
              >
                {brand}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-muted" />

      {/* Processor */}
      <FilterSection title="Processeur">
        <CheckboxGroup
          items={PROCESSORS}
          selected={filters.processors}
          onToggle={v => onToggle('processors', v)}
        />
      </FilterSection>

      <div className="h-px bg-muted" />

      {/* RAM */}
      <FilterSection title="Mémoire (RAM)">
        <CheckboxGroup
          items={RAM_OPTIONS}
          selected={filters.rams}
          onToggle={v => onToggle('rams', v)}
        />
      </FilterSection>

      <div className="h-px bg-muted" />

      {/* Storage */}
      <FilterSection title="Stockage" hint="SSD NVMe conseillé pour la vitesse">
        <CheckboxGroup
          items={STORAGE_OPTIONS}
          selected={filters.storages}
          onToggle={v => onToggle('storages', v)}
        />
      </FilterSection>

      <div className="h-px bg-muted" />

      {/* Graphics Card */}
      <FilterSection title="Carte graphique" hint="RTX pour gaming/vidéo, intégrée pour bureautique">
        <CheckboxGroup
          items={GRAPHICS_OPTIONS}
          selected={filters.graphicsCards}
          onToggle={v => onToggle('graphicsCards', v)}
        />
      </FilterSection>

      <div className="h-px bg-muted" />

      {/* Screen Size */}
      <FilterSection title="Taille d'écran" hint={'13-14" ultraportable / 15-17" confort visuel'}>
        <CheckboxGroup
          items={SCREEN_SIZES}
          selected={filters.screenSizes}
          onToggle={v => onToggle('screenSizes', v)}
        />
      </FilterSection>
    </aside>
  )
}
