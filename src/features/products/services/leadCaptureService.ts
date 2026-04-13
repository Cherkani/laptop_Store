import { supabase } from '@/lib/supabase'
import { getImageSrc } from '@/lib/utils'
import type { ProductWithImages } from '@/types/database.types'

const FALLBACK_WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim()
const FALLBACK_GOOGLE_WEBHOOK_URL = (import.meta.env.VITE_GOOGLE_WEBHOOK_URL || '').trim()

type LeadCaptureParams = {
  product: ProductWithImages
  quantity: number
  productUrl?: string
}

type LeadCaptureResult = {
  whatsappUrl: string
  googleSynced: boolean
}

function sanitizeNumber(value: string) {
  return value.replace(/\D/g, '')
}

function getPrimaryImageUrl(product: ProductWithImages) {
  const primary = product.product_images?.find(img => img.is_primary)
  return getImageSrc(primary) || getImageSrc(product.product_images?.[0]) || null
}

function buildLeadMessage({ product, quantity, productUrl }: LeadCaptureParams) {
  const total = product.price * quantity
  const lines = [
    'Bonjour, je veux commander cet article :',
    `${product.name} (${product.brand})`,
    `Quantité: ${quantity}`,
    `Prix unitaire: ${product.price.toLocaleString()} MAD`,
    `Total: ${total.toLocaleString()} MAD`,
  ]

  if (productUrl) lines.unshift(`Lien produit: ${productUrl}`)
  if (product.processor) lines.push(`CPU: ${product.processor}`)
  if (product.ram) lines.push(`RAM: ${product.ram}`)
  if (product.storage) lines.push(`Stockage: ${product.storage}`)

  return lines.join('\n')
}

function buildWhatsAppUrl(message: string, whatsappNumber: string) {
  const phone = sanitizeNumber(whatsappNumber)
  const text = encodeURIComponent(message)
  if (!phone) return `https://wa.me/?text=${text}`
  return `https://wa.me/${phone}?text=${text}`
}

async function pushGoogleWebhook(payload: Record<string, unknown>, webhookUrl: string) {
  if (!webhookUrl) return false
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}

async function getChannelSettings() {
  const settings = {
    whatsappNumber: FALLBACK_WHATSAPP_NUMBER,
    googleWebhookUrl: FALLBACK_GOOGLE_WEBHOOK_URL,
  }

  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['whatsapp_number_primary', 'whatsapp_number_secondary', 'whatsapp_number', 'google_webhook_url'])

  if (error || !data) return settings

  const map = new Map(data.map(item => [item.key, item.value || '']))
  const resolvedWhatsapp =
    map.get('whatsapp_number_primary') ||
    map.get('whatsapp_number') ||
    map.get('whatsapp_number_secondary') ||
    ''
  if (resolvedWhatsapp) settings.whatsappNumber = resolvedWhatsapp

  for (const item of data) {
    if (item.key === 'google_webhook_url' && item.value) settings.googleWebhookUrl = item.value
  }

  return settings
}

export async function sendWhatsAppLead(params: LeadCaptureParams): Promise<LeadCaptureResult> {
  const channels = await getChannelSettings()
  const productUrl = params.productUrl || (typeof window !== 'undefined' ? window.location.href : '')
  const imageUrl = getPrimaryImageUrl(params.product)
  const message = buildLeadMessage({ ...params, productUrl })
  const whatsappUrl = buildWhatsAppUrl(message, channels.whatsappNumber)

  const payload = {
    source: 'whatsapp',
    created_at: new Date().toISOString(),
    product_id: params.product.id,
    product_name: params.product.name,
    brand: params.product.brand,
    quantity: params.quantity,
    unit_price: params.product.price,
    total: params.product.price * params.quantity,
    image_url: imageUrl,
    product_url: productUrl,
    specs: {
      processor: params.product.processor,
      ram: params.product.ram,
      storage: params.product.storage,
      graphics_card: params.product.graphics_card,
      screen_size: params.product.screen_size,
      condition: params.product.condition,
    },
    whatsapp_message: message,
  }

  const googleSynced = await pushGoogleWebhook(payload, channels.googleWebhookUrl)

  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return { whatsappUrl, googleSynced }
}
