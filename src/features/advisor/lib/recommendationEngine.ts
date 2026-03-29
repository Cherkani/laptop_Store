import type { ProductWithImages } from '@/types/database.types'
import type {
  AdvisorAnswers,
  WorkflowBaseline,
  WorkflowDefinition,
} from '../data/workflowAdvisorData'

export interface AdvisorTarget extends WorkflowBaseline {
  budgetCeiling: number
  preferredDisplay: 'standard' | 'color' | 'refresh'
  referenceProfile: string
  mustHave: string[]
  betterToHave: string[]
  summary: string
}

export interface ScoredProduct {
  product: ProductWithImages
  score: number
  reasons: string[]
}

const RAM_RE = /(\d+)\s*gb/i
const STORAGE_TB_RE = /(\d+)\s*tb/i
const STORAGE_GB_RE = /(\d+)\s*gb/i
const SCREEN_RE = /(\d+(\.\d+)?)/i

function parseRamGb(value: string): number {
  const match = value.match(RAM_RE)
  return match ? parseInt(match[1], 10) : 0
}

function parseStorageGb(value: string): number {
  const tbMatch = value.match(STORAGE_TB_RE)
  if (tbMatch) return parseInt(tbMatch[1], 10) * 1024
  const gbMatch = value.match(STORAGE_GB_RE)
  if (gbMatch) return parseInt(gbMatch[1], 10)
  return 0
}

function parseScreenInches(value: string): number {
  const match = value.match(SCREEN_RE)
  return match ? parseFloat(match[1]) : 0
}

export function getCpuTier(processor: string): number {
  const value = processor.toLowerCase()

  if (value.includes('i9') || value.includes('ryzen 9') || value.includes('m4') || value.includes('m3')) return 5
  if (value.includes('i7') || value.includes('ryzen 7') || value.includes('m2')) return 4
  if (value.includes('i5') || value.includes('ryzen 5') || value.includes('m1')) return 3
  if (value.includes('i3') || value.includes('ryzen 3')) return 2
  return 2
}

export function getGpuTier(graphics: string): number {
  const value = graphics.toLowerCase()

  if (value.includes('rtx 4090') || value.includes('rtx 4080') || value.includes('rtx 4070')) return 5
  if (value.includes('rtx 4060') || value.includes('rtx 3070') || value.includes('rx 7600')) return 4
  if (value.includes('rtx 3060') || value.includes('rtx 3050') || value.includes('rx 6600')) return 3
  if (value.includes('gtx 1660') || value.includes('gtx 1650')) return 2
  if (value.includes('apple gpu')) return 3
  if (value.includes('nvidia') || value.includes('radeon')) return 2
  return 1
}

function isDedicatedGpu(graphics: string): boolean {
  const value = graphics.toLowerCase()
  return !(value.includes('integrated') || value.includes('apple gpu'))
}

function withFloor(value: number, floor: number): number {
  return value < floor ? floor : value
}

function clampTier(value: number): number {
  return Math.min(5, Math.max(1, value))
}

function buildBudgetCeiling(answer: string | undefined): number {
  switch (answer) {
    case 'value':
      return 5000
    case 'balanced':
      return 10000
    case 'performance':
      return 16000
    case 'premium':
      return 100000
    default:
      return 12000
  }
}

export function buildAdvisorTarget(
  workflow: WorkflowDefinition,
  answers: AdvisorAnswers,
): AdvisorTarget {
  const base = { ...workflow.baseline }

  const budgetCeiling = buildBudgetCeiling(answers.budget)
  const preferredDisplay =
    answers.display === 'color' || answers.display === 'refresh'
      ? answers.display
      : 'standard'

  if (answers.multitasking === 'medium') {
    base.minRamGb = withFloor(base.minRamGb, 16)
  }

  if (answers.multitasking === 'heavy') {
    base.minRamGb = withFloor(base.minRamGb, 32)
    base.idealRamGb = withFloor(base.idealRamGb, 32)
  }

  if (answers.performance === 'max') {
    base.minCpuTier = clampTier(withFloor(base.minCpuTier + 1, base.minCpuTier))
    base.idealCpuTier = clampTier(withFloor(base.idealCpuTier + 1, base.idealCpuTier))
    base.minGpuTier = clampTier(withFloor(base.minGpuTier + 1, base.minGpuTier))
  }

  if (answers.performance === 'efficient') {
    base.idealCpuTier = Math.max(base.minCpuTier, base.idealCpuTier - 1)
  }

  if (answers.portability === 'high') {
    base.preferredMaxScreenInches = 14.2
  }

  if (answers.portability === 'low' && workflow.key === 'gaming') {
    base.preferredMaxScreenInches = undefined
  }

  if (workflow.key === 'developers' && answers.primaryUse === 'ai') {
    base.requiresDedicatedGpu = true
    base.minGpuTier = withFloor(base.minGpuTier, 3)
    base.idealGpuTier = withFloor(base.idealGpuTier, 4)
  }

  if (workflow.key === 'creators' && answers.primaryUse === '3d') {
    base.minGpuTier = withFloor(base.minGpuTier, 3)
    base.idealGpuTier = withFloor(base.idealGpuTier, 4)
    base.idealStorageGb = withFloor(base.idealStorageGb, 1024)
  }

  if (workflow.key === 'gaming' && answers.primaryUse === 'stream') {
    base.minRamGb = withFloor(base.minRamGb, 32)
    base.idealRamGb = withFloor(base.idealRamGb, 32)
    base.minCpuTier = withFloor(base.minCpuTier, 4)
  }

  const referenceProfile =
    `${workflow.title.replace('For ', '')} Reference - ` +
    `${base.idealRamGb}GB RAM / ${base.idealStorageGb >= 1024 ? '1TB' : `${base.idealStorageGb}GB`} SSD / ` +
    `CPU Tier ${base.idealCpuTier}`

  const mustHave = [
    `${base.minRamGb}GB RAM minimum`,
    `${base.minStorageGb >= 1024 ? '1TB' : `${base.minStorageGb}GB`} SSD minimum`,
    `CPU tier ${base.minCpuTier}+`,
    `${base.requiresDedicatedGpu ? 'Dedicated GPU recommended' : 'Integrated GPU is acceptable'}`,
  ]

  if (base.preferredMaxScreenInches) {
    mustHave.push(`Screen around ${base.preferredMaxScreenInches}" or smaller for portability`)
  }

  const betterToHave = [
    `${base.idealRamGb}GB RAM for future-proofing`,
    `${base.idealStorageGb >= 1024 ? '1TB' : `${base.idealStorageGb}GB`} SSD for headroom`,
    `CPU tier ${base.idealCpuTier} for smoother heavy tasks`,
    preferredDisplay === 'color'
      ? 'Higher-color-accuracy panel (for creative work)'
      : preferredDisplay === 'refresh'
      ? 'High-refresh display (for motion-heavy workflows)'
      : 'Quality IPS/OLED panel for comfort and clarity',
  ]

  return {
    ...base,
    budgetCeiling,
    preferredDisplay,
    referenceProfile,
    mustHave,
    betterToHave,
    summary:
      `Built from your answers and online requirement baselines. ` +
      `Focus first on RAM, SSD, and CPU/GPU balance before extras.`,
  }
}

function scoreAgainstTarget(
  product: ProductWithImages,
  target: AdvisorTarget,
): ScoredProduct {
  const reasons: string[] = []
  let score = 0

  const ramGb = parseRamGb(product.ram)
  const storageGb = parseStorageGb(product.storage)
  const cpuTier = getCpuTier(product.processor)
  const gpuTier = getGpuTier(product.graphics_card)
  const dedicated = isDedicatedGpu(product.graphics_card)
  const screen = parseScreenInches(product.screen_size)

  if (product.price <= target.budgetCeiling) {
    score += 20
    reasons.push('Fits your budget')
  } else {
    const over = product.price - target.budgetCeiling
    const penalty = Math.min(20, Math.round((over / target.budgetCeiling) * 25))
    score += Math.max(0, 20 - penalty)
  }

  if (ramGb >= target.idealRamGb) {
    score += 20
    reasons.push(`Strong memory (${product.ram})`)
  } else if (ramGb >= target.minRamGb) {
    score += 14
  } else {
    score += 4
  }

  if (storageGb >= target.idealStorageGb) {
    score += 15
    reasons.push(`Good storage (${product.storage})`)
  } else if (storageGb >= target.minStorageGb) {
    score += 10
  } else {
    score += 2
  }

  if (cpuTier >= target.idealCpuTier) {
    score += 20
    reasons.push(`Strong CPU (${product.processor})`)
  } else if (cpuTier >= target.minCpuTier) {
    score += 14
  } else {
    score += 3
  }

  if (gpuTier >= target.idealGpuTier) {
    score += 20
    reasons.push(`Strong graphics (${product.graphics_card})`)
  } else if (gpuTier >= target.minGpuTier) {
    score += 13
  } else {
    score += 2
  }

  if (target.requiresDedicatedGpu && !dedicated) {
    score -= 12
  }

  if (target.preferredMaxScreenInches) {
    if (screen > 0 && screen <= target.preferredMaxScreenInches + 0.3) {
      score += 8
    } else if (screen > 0 && screen <= target.preferredMaxScreenInches + 1.5) {
      score += 4
    }
  } else {
    score += 4
  }

  return { product, score: Math.max(0, Math.min(100, score)), reasons }
}

export function getCompatibleProducts(
  products: ProductWithImages[],
  target: AdvisorTarget,
): ScoredProduct[] {
  return products
    .filter(product => product.stock_quantity > 0)
    .map(product => scoreAgainstTarget(product, target))
    .filter(item => item.score >= 55)
    .sort((a, b) => b.score - a.score)
}
