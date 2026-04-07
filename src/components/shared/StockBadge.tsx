import { Badge } from '@/components/ui/badge'
import { STOCK } from '@/lib/constants'

interface StockBadgeProps {
  quantity: number
  /** Short labels fit narrow table cells; default uses full labels */
  short?: boolean
}

/**
 * Renders a colour-coded stock status badge.
 * Used in AdminProductList, AdminInventoryPage, AdminReportsPage.
 *
 * Usage:
 *   <StockBadge quantity={product.stock_quantity} />
 *   <StockBadge quantity={product.stock_quantity} short />
 */
export function StockBadge({ quantity, short = false }: StockBadgeProps) {
  if (quantity === 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        {short ? 'Out' : 'Out of Stock'}
      </Badge>
    )
  }
  if (quantity <= STOCK.lowThreshold) {
    return (
      <Badge variant="warning" className="text-xs">
        {short ? 'Low' : 'Low Stock'}
      </Badge>
    )
  }
  return (
    <Badge variant="success" className="text-xs">
      {short ? 'OK' : 'In Stock'}
    </Badge>
  )
}

/** Inline stock quantity number styled by level (no badge — just a coloured number) */
export function StockQuantity({ quantity }: { quantity: number }) {
  const color =
    quantity === 0
      ? 'text-red-500'
      : quantity <= STOCK.lowThreshold
      ? 'text-amber-500'
      : 'text-emerald-600'

  return <span className={`font-bold ${color}`}>{quantity}</span>
}
