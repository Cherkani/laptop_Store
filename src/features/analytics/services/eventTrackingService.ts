import { supabase } from '@/lib/supabase'

type TrackEventInput = {
  eventType: 'product_view' | 'product_card_click' | 'whatsapp_click' | 'add_to_cart'
  productId?: string | null
  productName?: string | null
  metadata?: Record<string, unknown>
}

const SESSION_KEY = 'laptopstore-analytics-session'
let actorContextPromise: Promise<{ userId: string | null; isAdmin: boolean }> | null = null
const recentEvents = new Map<string, number>()

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  const existing = window.sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing
  const created = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  window.sessionStorage.setItem(SESSION_KEY, created)
  return created
}

async function getActorContext() {
  if (!actorContextPromise) {
    actorContextPromise = (async () => {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id ?? null
      if (!userId) return { userId: null, isAdmin: false }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle()

      return { userId, isAdmin: !!profile?.is_admin }
    })()
  }
  return actorContextPromise
}

function duplicateWindowMs(eventType: TrackEventInput['eventType']) {
  if (eventType === 'product_view') return 5000
  return 1200
}

function eventKey(input: TrackEventInput, pagePath: string | null, sessionId: string) {
  const source = typeof input.metadata?.source === 'string' ? input.metadata.source : ''
  const quantity = typeof input.metadata?.quantity === 'number' ? String(input.metadata.quantity) : ''
  return [sessionId, input.eventType, input.productId ?? input.productName ?? '', pagePath ?? '', source, quantity].join('|')
}

function isDuplicate(input: TrackEventInput, pagePath: string | null, sessionId: string) {
  const key = eventKey(input, pagePath, sessionId)
  const now = Date.now()
  const previous = recentEvents.get(key)
  if (previous && now - previous < duplicateWindowMs(input.eventType)) return true
  recentEvents.set(key, now)

  // keep map bounded
  if (recentEvents.size > 500) {
    for (const [k, ts] of recentEvents) {
      if (now - ts > 60_000) recentEvents.delete(k)
    }
  }
  return false
}

export async function trackEvent(input: TrackEventInput) {
  try {
    const actor = await getActorContext()
    if (actor.isAdmin) return
    const sessionId = getSessionId()
    const pagePath = typeof window !== 'undefined' ? window.location.pathname : null
    if (isDuplicate(input, pagePath, sessionId)) return

    await supabase.from('analytics_events').insert({
      event_type: input.eventType,
      product_id: input.productId ?? null,
      product_name: input.productName ?? null,
      page_path: pagePath,
      session_id: sessionId,
      metadata: { ...(input.metadata ?? {}), actor_user_id: actor.userId, actor_is_admin: false },
    } as never)
  } catch {
    // analytics must never block UX
  }
}
