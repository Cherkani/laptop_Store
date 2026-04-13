import { supabase } from '@/lib/supabase'

type TrackEventInput = {
  eventType: 'product_view' | 'product_card_click' | 'whatsapp_click' | 'add_to_cart'
  productId?: string | null
  productName?: string | null
  metadata?: Record<string, unknown>
}

const SESSION_KEY = 'laptopstore-analytics-session'
let actorContextPromise: Promise<{ userId: string | null; isAdmin: boolean }> | null = null

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

export async function trackEvent(input: TrackEventInput) {
  try {
    const actor = await getActorContext()
    if (actor.isAdmin) return

    await supabase.from('analytics_events').insert({
      event_type: input.eventType,
      product_id: input.productId ?? null,
      product_name: input.productName ?? null,
      page_path: typeof window !== 'undefined' ? window.location.pathname : null,
      session_id: getSessionId(),
      metadata: { ...(input.metadata ?? {}), actor_user_id: actor.userId, actor_is_admin: false },
    } as never)
  } catch {
    // analytics must never block UX
  }
}
