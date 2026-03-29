import { supabase } from '@/lib/supabase'
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
  persisted: boolean
  googleSynced: boolean
  errorMessage?: string
}

function sanitizeNumber(value: string) {
  return value.replace(/\D/g, '')
}

function getPrimaryImageUrl(product: ProductWithImages) {
  const primary = product.product_images?.find(img => img.is_primary)
  return primary?.image_url || product.product_images?.[0]?.image_url || null
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

  if (product.processor) lines.push(`CPU: ${product.processor}`)
  if (product.ram) lines.push(`RAM: ${product.ram}`)
  if (product.storage) lines.push(`Stockage: ${product.storage}`)
  if (productUrl) lines.push(`Lien produit: ${productUrl}`)

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
    .in('key', ['whatsapp_number', 'google_webhook_url'])

  if (error || !data) return settings

  for (const item of data) {
    if (item.key === 'whatsapp_number' && item.value) {
      settings.whatsappNumber = item.value
    }
    if (item.key === 'google_webhook_url' && item.value) {
      settings.googleWebhookUrl = item.value
    }
  }

  return settings
}

export async function sendWhatsAppLead(params: LeadCaptureParams): Promise<LeadCaptureResult> {
  const channels = await getChannelSettings()
  const productUrl = params.productUrl || (typeof window !== 'undefined' ? window.location.href : '')
  const payloadParams = { ...params, productUrl }
  const message = buildLeadMessage(payloadParams)
  const whatsappUrl = buildWhatsAppUrl(message, channels.whatsappNumber)

  const leadId = crypto.randomUUID()
  const imageUrl = getPrimaryImageUrl(params.product)
  const total = params.product.price * params.quantity

  const payload = {
    lead_id: leadId,
    source: 'whatsapp',
    created_at: new Date().toISOString(),
    product_id: params.product.id,
    product_name: params.product.name,
    brand: params.product.brand,
    quantity: params.quantity,
    unit_price: params.product.price,
    total,
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

  let persisted = true
  let errorMessage: string | undefined

  try {
    const { error: recordError } = await supabase
      .from('sales_records')
      .insert({
        id: leadId,
        client_name: null,
        client_phone: null,
        client_whatsapp: null,
        source: 'whatsapp',
        lead_title: params.product.name,
        lead_message: message,
        status: 'new',
        currency: 'MAD',
        subtotal: total,
        total,
        product_snapshot: [
          {
            product_id: params.product.id,
            name: params.product.name,
            brand: params.product.brand,
            quantity: params.quantity,
            unit_price: params.product.price,
            image_url: imageUrl,
          },
        ],
        image_url: imageUrl,
        external_payload: payload,
      } as never)

    if (recordError) throw recordError

    const { error: itemError } = await supabase
      .from('sales_record_items')
      .insert({
        sales_record_id: leadId,
        product_id: params.product.id,
        product_name: params.product.name,
        image_url: imageUrl,
        quantity: params.quantity,
        unit_price: params.product.price,
      } as never)

    if (itemError) throw itemError
  } catch (error) {
    persisted = false
    errorMessage = error instanceof Error ? error.message : 'Lead capture failed'
  }

  const googleSynced = await pushGoogleWebhook(payload, channels.googleWebhookUrl)

  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return {
    whatsappUrl,
    persisted,
    googleSynced,
    errorMessage,
  }
}
