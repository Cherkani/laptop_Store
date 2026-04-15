import { GRAPHICS_OPTIONS, SCREEN_SIZES } from '@/features/products/types'

/** Normalize a raw GPU string to the closest value in GRAPHICS_OPTIONS */
export const normalizeGpu = (raw: string): string => {
  const upper = raw.toUpperCase().replace(/\s+/g, ' ').trim()

  // 1. Direct substring match against known options (most reliable)
  for (const option of GRAPHICS_OPTIONS) {
    if (upper.includes(option.toUpperCase())) return option
  }

  // 2. RTX model — consumer (RTX 4060) and professional (RTX A2000, Quadro RTX A3000)
  const rtxProMatch = upper.match(/RTX\s+A(\d{3,5})/)
  if (rtxProMatch) return `NVIDIA RTX A${rtxProMatch[1]}`

  const rtxMatch = upper.match(/RTX\s?(\d{3,5})(\s?TI)?/)
  if (rtxMatch) {
    const model = rtxMatch[1]
    const ti = rtxMatch[2] ? ' Ti' : ''
    const found = GRAPHICS_OPTIONS.find(g => g.toUpperCase().includes(`RTX ${model}${ti.toUpperCase()}`))
      ?? GRAPHICS_OPTIONS.find(g => g.toUpperCase().includes(`RTX ${model}`))
    if (found) return found
    return `NVIDIA RTX ${model}${ti}`
  }

  // 3. GTX model number
  const gtxMatch = upper.match(/GTX\s?(\d{3,5})(\s?TI)?/)
  if (gtxMatch) {
    const model = gtxMatch[1]
    const ti = gtxMatch[2] ? ' Ti' : ''
    const found = GRAPHICS_OPTIONS.find(g => g.toUpperCase().includes(`GTX ${model}${ti.toUpperCase()}`))
      ?? GRAPHICS_OPTIONS.find(g => g.toUpperCase().includes(`GTX ${model}`))
    if (found) return found
    return `NVIDIA GTX ${model}${ti}`
  }

  // 4. AMD Radeon RX model — e.g. "Radeon RX 6600", "RX6600", "RX 7600"
  const rxMatch = upper.match(/RX\s?(\d{4})(\s?XT)?/)
  if (rxMatch) {
    const model = rxMatch[1]
    const found = GRAPHICS_OPTIONS.find(g => g.toUpperCase().includes(`RX ${model}`))
    if (found) return found
    return `AMD Radeon RX ${model}`
  }

  // 5. Apple GPU
  if (/APPLE\s*GPU|APPLE\s*M\d/.test(upper)) return 'Apple GPU'

  // 6. Intel Arc
  if (/INTEL\s*ARC/.test(upper)) return 'Intel Integrated'

  // 7. Intel integrated (Iris Xe, UHD, HD Graphics, Intel Graphics, intégrée)
  if (/IRIS|UHD|INTEL\s*(HD|GRAPHICS)|INT[EÉ]GR[EÉ]/.test(upper)) return 'Intel Integrated'

  // 8. AMD integrated (Vega, Radeon Graphics without RX model)
  if (/AMD|RADEON|VEGA/.test(upper)) return 'AMD Integrated'

  // 9. Fallback — return cleaned raw
  return raw.replace(/\s+/g, ' ').trim()
}

/** Normalize a raw screen size string to the closest value in SCREEN_SIZES */
export const normalizeScreenSize = (raw: string): string => {
  // Strip symbols/words, keep digits and dot
  const num = raw.replace(/[^0-9.]/g, '')
  if (!num) return raw
  return SCREEN_SIZES.find(s => s.replace('"', '') === num) ?? `${num}"`
}

/** Normalize a raw RAM string to a canonical form like "16GB" */
export const normalizeRam = (raw: string): string => {
  const upper = raw.toUpperCase().replace(/\bGO\b/g, 'GB').replace(/\s+/g, ' ').trim()
  const m = upper.match(/^(\d+)\s?GB/)
  if (!m) return raw
  return `${m[1]}GB`
}

/** Normalize a raw storage string to a canonical form like "512GB SSD" */
export const normalizeStorage = (raw: string): string => {
  const upper = raw.toUpperCase().replace(/\bGO\b/g, 'GB').replace(/\bTO\b/g, 'TB').replace(/\s+/g, ' ').trim()
  const m = upper.match(/(\d+(?:\.\d)?)\s?(TB|GB)/)
  if (!m) return raw
  const [, num, unit] = m
  // Keep SSD suffix if present, otherwise add it for GB sizes (storage, not RAM)
  const hasSsd = /SSD|NVME|PCIE/.test(upper)
  return `${num}${unit}${hasSsd ? ' SSD' : unit === 'TB' ? ' SSD' : ''}`
}
