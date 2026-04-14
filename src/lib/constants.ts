/* ============================================================
   CENTRAL CONSTANTS
   Single source of truth for all business values, layout
   tokens, and repeated magic strings. Import from here —
   never hardcode these values in components.
   ============================================================ */

// ── Brand ────────────────────────────────────────────────────
export const BRAND = {
  name: 'CASALAPTOPS.COM',
  shortName: 'Casa By Tech',
  tagline: 'Premium laptops reconditionnés',
} as const

const formatWhatsapp = (raw: string) => {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('212') && digits.length === 12) {
    const local = digits.slice(3)
    return `+212 ${local[0]} ${local.slice(1, 3)} ${local.slice(3, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`
  }
  if (digits.length > 0) return `+${digits}`
  return ''
}

const DEFAULT_WHATSAPP = (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim()

// ── Contact ──────────────────────────────────────────────────
export const CONTACT = {
  /** Raw digits only — use for wa.me links */
  whatsappRaw: DEFAULT_WHATSAPP.replace(/\D/g, ''),
  /** Display-formatted number */
  whatsappFormatted: formatWhatsapp(DEFAULT_WHATSAPP),
  businessHours: 'Lun - Dim · 9h00 - 23h00',
} as const

export const WHATSAPP_URL = `https://wa.me/${CONTACT.whatsappRaw}`

// ── Layout ───────────────────────────────────────────────────
export const LAYOUT = {
  /** Standard max-width for all page containers */
  maxWidth: 'max-w-[1260px]',
  /** Standard horizontal padding */
  containerPx: 'px-4 sm:px-6 lg:px-8',
  /** Standard vertical section padding */
  sectionPy: 'py-14 sm:py-18 lg:py-24',
} as const

// ── Z-index scale ────────────────────────────────────────────
export const Z = {
  header: 40,
  drawer: 40,
  modal: 50,
  toast: 100,
} as const

// ── Product catalogue ────────────────────────────────────────
export const WINDOWS_BRANDS = ['ASUS', 'Dell', 'HP', 'Lenovo', 'MSI', 'Acer', 'Razer'] as const
export const MAC_BRANDS = ['MacBook Air', 'MacBook Pro'] as const

/** CDN logo URLs — always rendered on dark surfaces (white variant) */
export const BRAND_LOGOS: Record<string, string> = {
  ASUS:   'https://cdn.simpleicons.org/asus/ffffff',
  Dell:   'https://cdn.simpleicons.org/dell/ffffff',
  HP:     'https://cdn.simpleicons.org/hp/ffffff',
  Lenovo: 'https://cdn.simpleicons.org/lenovo/ffffff',
  MSI:    'https://cdn.simpleicons.org/msi/ffffff',
  Acer:   'https://cdn.simpleicons.org/acer/ffffff',
  Razer:  'https://cdn.simpleicons.org/razer/ffffff',
  Apple:  'https://cdn.simpleicons.org/apple/ffffff',
}

// ── Stock thresholds ─────────────────────────────────────────
export const STOCK = {
  lowThreshold: 5,
} as const

// ── Condition badge styles (used in ProductCard + ProductDetailPage) ──
export const CONDITION_STYLES: Record<string, { label: string; className: string }> = {
  'Like New': { label: 'Reconditionné+', className: 'bg-orange-500/8 text-orange-400 border-orange-500/15 backdrop-blur-sm' },
  Excellent:  { label: 'Reconditionné',  className: 'bg-orange-500/8 text-orange-400 border-orange-500/15 backdrop-blur-sm' },
  Good:       { label: 'Reconditionné',  className: 'bg-orange-500/8 text-orange-400 border-orange-500/15 backdrop-blur-sm' },
  Fair:       { label: 'Reconditionné',  className: 'bg-orange-500/8 text-orange-400 border-orange-500/15 backdrop-blur-sm' },
}
