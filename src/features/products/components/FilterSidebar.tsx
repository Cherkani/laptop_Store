import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { cn, formatPrice } from '@/lib/utils'
import type { ProductFilters } from '../types'
import { BRANDS, PROCESSORS, RAM_OPTIONS, STORAGE_OPTIONS, GRAPHICS_OPTIONS, SCREEN_SIZES, DEFAULT_FILTERS } from '../types'

interface FilterSidebarProps {
  filters: ProductFilters
  onToggle: (key: 'brands' | 'processors' | 'rams' | 'storages' | 'graphicsCards' | 'screenSizes', value: string) => void
  onFilterChange: (updates: Partial<ProductFilters>) => void
  onClear: () => void
  activeFilterCount: number
  className?: string
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-slate-900">{title}</h3>
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
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {items.map(item => (
        <div key={item} className="flex items-center gap-2">
          <Checkbox
            id={item}
            checked={selected.includes(item)}
            onCheckedChange={() => onToggle(item)}
          />
          <Label
            htmlFor={item}
            className={cn(
              'text-sm cursor-pointer font-normal',
              selected.includes(item) ? 'text-slate-900 font-medium' : 'text-muted-foreground'
            )}
          >
            {item}
          </Label>
        </div>
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
    <aside className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-600" />
          <span className="font-semibold text-slate-900">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="default" className="h-5 text-xs">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs h-7 px-2">
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <Separator />

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          <Slider
            min={0}
            max={DEFAULT_FILTERS.priceRange[1]}
            step={50}
            value={filters.priceRange}
            onValueChange={value => onFilterChange({ priceRange: value as [number, number] })}
            defaultValue={[0, DEFAULT_FILTERS.priceRange[1]]}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])}</span>
            <span>{formatPrice(filters.priceRange[1])}</span>
          </div>
        </div>
      </FilterSection>

      <Separator />

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="inStock"
          checked={filters.inStockOnly}
          onCheckedChange={checked => onFilterChange({ inStockOnly: !!checked })}
        />
        <Label htmlFor="inStock" className="text-sm cursor-pointer font-medium">In Stock Only</Label>
      </div>

      <Separator />

      {/* Brand */}
      <FilterSection title="Brand">
        <CheckboxGroup
          items={BRANDS}
          selected={filters.brands}
          onToggle={v => onToggle('brands', v)}
        />
      </FilterSection>

      <Separator />

      {/* Processor */}
      <FilterSection title="Processor">
        <CheckboxGroup
          items={PROCESSORS}
          selected={filters.processors}
          onToggle={v => onToggle('processors', v)}
        />
      </FilterSection>

      <Separator />

      {/* RAM */}
      <FilterSection title="RAM">
        <CheckboxGroup
          items={RAM_OPTIONS}
          selected={filters.rams}
          onToggle={v => onToggle('rams', v)}
        />
      </FilterSection>

      <Separator />

      {/* Storage */}
      <FilterSection title="Storage">
        <CheckboxGroup
          items={STORAGE_OPTIONS}
          selected={filters.storages}
          onToggle={v => onToggle('storages', v)}
        />
      </FilterSection>

      <Separator />

      {/* Graphics Card */}
      <FilterSection title="Graphics Card">
        <CheckboxGroup
          items={GRAPHICS_OPTIONS}
          selected={filters.graphicsCards}
          onToggle={v => onToggle('graphicsCards', v)}
        />
      </FilterSection>

      <Separator />

      {/* Screen Size */}
      <FilterSection title="Screen Size">
        <CheckboxGroup
          items={SCREEN_SIZES}
          selected={filters.screenSizes}
          onToggle={v => onToggle('screenSizes', v)}
        />
      </FilterSection>
    </aside>
  )
}
