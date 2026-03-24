export interface ProductFilters {
  search: string
  brands: string[]
  processors: string[]
  rams: string[]
  storages: string[]
  graphicsCards: string[]
  screenSizes: string[]
  priceRange: [number, number]
  inStockOnly: boolean
  sortBy: SortOption
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name_asc'

export const BRANDS = ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Razer', 'Samsung', 'LG']
export const PROCESSORS = ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3', 'Apple M4']
export const RAM_OPTIONS = ['4GB', '8GB', '16GB', '32GB', '64GB']
export const STORAGE_OPTIONS = ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD']
export const GRAPHICS_OPTIONS = ['Intel Integrated', 'AMD Integrated', 'NVIDIA GTX 1650', 'NVIDIA GTX 1660', 'NVIDIA RTX 3050', 'NVIDIA RTX 3060', 'NVIDIA RTX 4060', 'NVIDIA RTX 4070', 'NVIDIA RTX 4090', 'AMD Radeon RX 6600', 'AMD Radeon RX 7600', 'Apple GPU']
export const SCREEN_SIZES = ['13"', '13.3"', '14"', '14.2"', '15"', '15.6"', '16"', '17"', '17.3"']

export const DEFAULT_FILTERS: ProductFilters = {
  search: '',
  brands: [],
  processors: [],
  rams: [],
  storages: [],
  graphicsCards: [],
  screenSizes: [],
  priceRange: [0, 5000],
  inStockOnly: false,
  sortBy: 'newest',
}
