import { BRANDS } from '@/features/products/types'

export interface ParsedSpec {
  key: string
  value: string
}

export interface ParsedListing {
  name?: string
  price?: string
  brand?: string
  processor?: string
  ram?: string
  storage?: string
  graphics_card?: string
  screen_size?: string
  description?: string
  specs?: ParsedSpec[]
}

const normalizeNumber = (n?: string | null) => {
  if (!n) return undefined
  const cleaned = n.replace(/[^\d.,]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed.toString() : undefined
}

export const parseListing = (raw: string): ParsedListing => {
  const text = raw.replace(/\s+/g, ' ').trim()
  if (!text) return {}

  const lines = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)

  // Name: first non-empty line without price markers
  const nameLine = lines.find(l => !/dhs|mad|prix[:\s]/i.test(l)) || lines[0]

  // Price in MAD
  const priceMatch = text.match(/([0-9][\d\s]{2,})(?:\s?(?:dhs|dh|mad))/i)
  const price = priceMatch ? normalizeNumber(priceMatch[1]) : undefined

  // Brand detection
  const brand = BRANDS.find(b => new RegExp(b.replace(/\s+/g, '\\s*'), 'i').test(text))

  // Processor
  const cpuMatch = text.match(/(M\d\s?Pro?|Ryzen\s?(?:AI\s?)?\d{1,3}|Intel(?:\sCore)?\s(?:Ultra\s)?[i\d\s-]+H|i[3579]-?\d{3,4}[a-zA-Z]?)/i)
  const processor = cpuMatch ? cpuMatch[0].replace(/\s+/g, ' ').trim() : undefined

  // RAM
  const ramMatch = text.match(/(\d{2}|\d)\s?GB(?:\s?(?:DDR\d|LPDDR\d))?/i)
  const ram = ramMatch ? ramMatch[0].replace(/\s+/g, ' ').toUpperCase() : undefined

  // Storage
  const storageMatch = text.match(/(\d+(?:\.\d)?\s?(?:TB|GB))(?:[^\n]*?(SSD|NVMe|PCIe))?/i)
  const storage = storageMatch ? storageMatch[0].replace(/\s+/g, ' ').toUpperCase() : undefined

  // GPU
  const gpuMatch = text.match(/(RTX\s?\d{3,4}|GTX\s?\d{3,4}|Radeon\s?\w+|Apple GPU|Intel Iris Xe|GeForce\sRTX\s?\d+)/i)
  const graphics_card = gpuMatch ? gpuMatch[0].replace(/\s+/g, ' ').toUpperCase() : undefined

  // Screen size
  const screenMatch = text.match(/(\d{2}(?:\.\d)?)\s?[\"”]/)
  const screen_size = screenMatch ? `${screenMatch[1]}"` : undefined

  // Specs from bullet lines
  const specLines = lines.filter(l => /^[-*•]/.test(l))
  const specsParsed: ParsedSpec[] = specLines
    .map(line => {
      const cleaned = line.replace(/^[-*•]\s*/, '')
      const [k, v] = cleaned.split(/[:：]-?\s?/, 2)
      return {
        key: (v ? k : cleaned.split(' ').slice(0, 2).join(' ')) || '',
        value: v || cleaned,
      }
    })
    .filter(s => s.key || s.value)

  return {
    name: nameLine,
    price,
    brand,
    processor,
    ram,
    storage,
    graphics_card,
    screen_size,
    description: lines.filter(l => !/^[-*•]/.test(l)).slice(1).join(' '),
    specs: specsParsed,
  }
}
