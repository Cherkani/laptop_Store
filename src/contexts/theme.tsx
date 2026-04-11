import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'laptopstore-theme'

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme())
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => 'light')

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const current = theme === 'system' ? getSystemTheme() : theme
      setResolvedTheme(current)
      document.documentElement.classList.toggle('dark', current === 'dark')
    }

    const onMediaChange = () => {
      if (theme === 'system') {
        applyTheme()
      }
    }

    applyTheme()
    media.addEventListener('change', onMediaChange)

    return () => {
      media.removeEventListener('change', onMediaChange)
    }
  }, [theme])

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme)
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
