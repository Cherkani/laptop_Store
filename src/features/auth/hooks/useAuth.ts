import { useState, useEffect, createContext, useContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database.types'

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function useAuthState() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(data as Profile | null)
    } catch {
      // profile might not exist yet
    } finally {
      setIsLoading(false)
    }
  }

  return {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.is_admin ?? false,
    isLoading,
  }
}
