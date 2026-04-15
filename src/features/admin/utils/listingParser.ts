import { BRANDS } from '@/features/products/types'
import { normalizeGpu, normalizeScreenSize, normalizeRam, normalizeStorage } from '@/lib/normalizeSpecs'

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
  condition?: string
  description?: string
  specs?: ParsedSpec[]
}

/** Strip trademark/copyright symbols that appear inside product names in listings */
const stripSymbols = (s: string) =>
  s.replace(/[®™©]/g, '').replace(/\s+/g, ' ').trim()

/** Strip leading emoji and punctuation from a line (used for name extraction) */
const stripLeadingEmoji = (s: string) =>
  s.replace(/^[\p{Emoji}\p{So}\p{Sk}✅🔹🔸➡️👉💰📦⚡🚀🔥💻⭐🎮🖥️📡🔋📸🔐⌨️🪟🎧🔊💾🧠]+\s*/u, '').trim()

const normalizeNumber = (n?: string | null) => {
  if (!n) return undefined
  const cleaned = n.replace(/[^\d.,]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed.toString() : undefined
}

/** Detect condition from listing text */
const detectCondition = (text: string): string | undefined => {
  const t = text.toLowerCase()
  if (/\bneuf\b|\bnew\b|brand.?new|jamais utilis[eé]|jamais ouvert/.test(t)) return 'Neuf'
  if (/comme\s+neuf|very\s+good|excellent|quasi\s+neuf|[eé]tat\s+impeccable|[eé]tat\s+parfait/.test(t)) return 'Comme neuf'
  if (/bon\s+[eé]tat|good\s+condition|used|occasion|reconditionn[eé]/.test(t)) return 'Comme neuf'
  return undefined
}

/** Extract the canonical processor string, tolerating ®/™ symbols and vPro suffixes */
const extractProcessor = (text: string): string | undefined => {
  // Normalize symbols before matching
  const clean = stripSymbols(text)
  const m = clean.match(
    /(Intel\s+Core\s+Ultra\s+[579]\d*[-\s]?\d{0,5}[a-zA-Z]{0,3}|Intel\s+Core\s+i[3579][-\s]?\d{2,5}[a-zA-Z]{0,3}|Intel\s+Core\s+i[3579]|Celeron\s+\w+|Pentium\s+\w+|Ryzen\s+(?:AI\s+)?(?:3|5|7|9)\s+\d{3,5}[a-zA-Z]{0,3}|Ryzen\s+(?:AI\s+)?(?:3|5|7|9)|Apple\s+M[1-4](?:\s+(?:Pro|Max|Ultra))?|M[1-4](?:\s+(?:Pro|Max|Ultra))?)/i,
  )
  if (!m) return undefined
  // Remove trailing vPro/variant suffixes that aren't part of the model name
  return m[0].replace(/\s+vPro[®™]?(\s+.*)?$/i, '').replace(/\s+/g, ' ').trim()
}

export const parseListing = (raw: string): ParsedListing => {
  const text = raw.replace(/\s+/g, ' ').trim()
  if (!text) return {}

  const lines = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)

  // Name: first non-empty line that isn't a pure price line, stripped of emoji
  const rawNameLine = lines.find(l => !/^\s*[\d\s]+\s*(?:dhs|dh|mad)\s*[^\w]?$/i.test(l) && !/^(?:prix|price)\s*[:：]/i.test(l)) ?? lines[0]
  const nameLine = stripLeadingEmoji(rawNameLine)

  // Price — accepts "9500 DHS 🚀", "Prix : 6000 DHS", "💰 Prix : 7500 DHS", "13500 DHS"
  const priceMatch =
    text.match(/(?:prix|price)\s*[:：]\s*([\d\s]{3,8})(?:\s?(?:dhs|dh|mad))/i) ||
    text.match(/([\d][\d\s]{2,7})(?:\s?(?:dhs|dh|mad))/i)
  const price = priceMatch ? normalizeNumber(priceMatch[1]) : undefined

  // Brand detection
  const brand = BRANDS.find(b => new RegExp(`\\b${b.replace(/\s+/g, '\\s*')}\\b`, 'i').test(text))

  // Processor — strip symbols first, tolerates vPro®, ™ etc.
  const processor = extractProcessor(text)

  // RAM — "32 Go DDR5", "16GB", "16 Go DDR4 3200", "16 Go LPDDR5"
  // Match digits followed by GB/Go, optionally followed by DDR type info
  const ramMatch = text.match(/(\d{1,3})\s?(?:GB|Go)\b(?:\s?(?:LPDDR\d[Xx]?|DDR\d)(?:\s+[\d,]+)?)?/i)
  const ram = ramMatch ? normalizeRam(ramMatch[0]) : undefined

  // Storage — prioritize label lines ("Stockage :", "SSD :", "💾 Stockage :") then patterns
  const storageLabelMatch = text.match(
    /(?:stockage|storage|disque|hdd|ssd)\s*[:：]\s*(?:SSD\s+)?([^\n,]{3,50})/i,
  )
  const storageFreeMatch =
    // "1 To M.2 PCIe NVMe" / "512 Go M.2" — size then context
    text.match(/(\d+(?:\.\d)?\s?(?:TB|GB|Go|To))\s+(?:M\.2|PCIe|NVMe|SSD|HDD)[^\n,]{0,40}/i) ||
    // "SSD M.2 PCIe 4.0 512 Go" — context then size (generous 40-char window)
    text.match(/(?:SSD|NVMe|M\.2|PCIe)[^\n,]{0,40}?(\d+(?:\.\d)?\s?(?:TB|GB|Go|To))\b/i) ||
    // "SSD 512 Go" / "SSD 1 To"
    text.match(/(?:SSD|NVMe)\s+(\d+(?:\.\d)?\s?(?:TB|GB|Go|To))\b/i) ||
    // Fallback: large standalone value not equal to RAM
    (() => {
      const ramNum = ramMatch?.[1]
      const matches = [...text.matchAll(/(\d+(?:\.\d)?)\s?(TB|Go|To|GB)/gi)]
      const c = matches.find(m => {
        const unit = m[2].toUpperCase()
        const num = parseInt(m[1])
        if ((unit === 'GB' || unit === 'GO') && String(num) === ramNum) return false
        if ((unit === 'TB' || unit === 'TO') && num >= 1 && num <= 8) return true
        if ((unit === 'GB' || unit === 'GO') && num >= 128) return true
        return false
      })
      return c ? [c[0], c[0]] as RegExpMatchArray : null
    })()

  const storageRaw = storageLabelMatch?.[1]?.trim() ?? storageFreeMatch?.[0]?.trim()
  const storage = storageRaw ? normalizeStorage(storageRaw) : undefined

  // GPU — label lines first (most reliable), then freeform patterns
  const gpuLabelMatch = text.match(
    /(?:carte\s+graphique|gpu|graphics?\s+card|graphique|vid[eé]o)\s*[:：]\s*([^\n]{3,60})/i,
  )
  const gpuFreeMatch = text.match(
    /((?:NVIDIA\s+)?(?:GeForce\s+)?(?:Quadro\s+)?RTX\s+[A-Z]?\d{3,5}(?:\s?Ti)?|(?:NVIDIA\s+)?(?:GeForce\s+)?GTX\s?\d{3,4}(?:\s?Ti)?|(?:AMD\s+)?Radeon\s+(?:RX\s+)?\d{4}(?:\s?XT)?|RX\s?\d{4}(?:\s?XT)?|Intel\s+Arc\s+[A-Za-z]\d{3,4}[A-Za-z]?|Intel\s+(?:Iris\s+Xe|UHD\s+Graphics\s*\d*|HD\s+Graphics\s*\d*)|Apple\s+GPU|AMD\s+(?:Radeon\s+)?(?:Vega|Graphics\s+\d+))/i,
  )
  // Also detect "Intel intégrée" / "intégrée" patterns that don't match above
  const gpuIntegratedMatch = text.match(
    /(?:graphiques?\s+[:：]\s*)?intel\s+int[eé]gr[eé]e?|graphiques?\s+int[eé]gr[eé]es?/i,
  )

  const gpuRaw = stripSymbols(
    gpuLabelMatch?.[1]?.trim() ?? gpuFreeMatch?.[0]?.trim() ?? ''
  )
  const graphics_card = gpuRaw
    ? normalizeGpu(gpuRaw)
    : gpuIntegratedMatch
      ? 'Intel Integrated'
      : undefined

  // Screen size — "16" FHD+", "15,6"", "15.6 pouces", "13.5"" (1 or 2 decimal digits)
  const screenMatch = text.match(/(\d{2}(?:[.,]\d{1,2})?)\s?(?:[""\u201C\u201D]|pouces?|inch(?:es)?|\bin\b|\bpo\b)/i)
  const screen_size = screenMatch ? normalizeScreenSize(screenMatch[1].replace(',', '.')) : undefined

  // Condition
  const condition = detectCondition(text)

  // Specs from emoji-prefixed or bullet lines (🔹, •, -, *, ➡️, etc.)
  const specLines = lines.filter(l =>
    /^[-*•]/.test(l) ||
    /^[\p{Emoji}]/u.test(l) && /[:：]/.test(l),
  )
  const specsParsed: ParsedSpec[] = specLines
    .map(line => {
      const cleaned = stripLeadingEmoji(line.replace(/^[-*•➡️]\s*/, ''))
      const colonIdx = cleaned.search(/[:：]/)
      if (colonIdx < 1) return null
      const key = cleaned.slice(0, colonIdx).trim()
      const value = cleaned.slice(colonIdx + 1).trim()
      if (!key || !value) return null
      return { key, value }
    })
    .filter((s): s is ParsedSpec => s !== null)

  return {
    name: nameLine,
    price,
    brand: brand ?? undefined,
    processor,
    ram,
    storage,
    graphics_card,
    screen_size,
    condition,
    description: lines
      .filter(l => !/^[-*•]/.test(l) && !(/^[\p{Emoji}]/u.test(l) && /[:：]/.test(l)))
      .slice(1)
      .map(stripLeadingEmoji)
      .filter(Boolean)
      .join('\n'),
    specs: specsParsed,
  }
}
