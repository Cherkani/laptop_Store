import { Globe2, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/theme'
import { useI18n } from '@/contexts/i18n'
import { Button } from '@/components/ui/button'

type Props = {
  compact?: boolean
  className?: string
}

export function SitePreferences({ compact = false, className }: Props) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const { locale, setLocale, t } = useI18n()

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ''}`}>
      <Button
        type="button"
        variant="ghost"
        size={compact ? 'icon' : 'sm'}
        onClick={toggleTheme}
        aria-label={t('theme.toggle')}
        className="text-foreground/80 hover:bg-accent"
      >
        {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {!compact && <span className="ml-1.5 text-xs">{resolvedTheme === 'dark' ? t('theme.light') : t('theme.dark')}</span>}
      </Button>

      <div className="relative">
        {!compact && <Globe2 className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />}
        <select
          aria-label={t('lang.label')}
          value={locale}
          onChange={e => setLocale(e.target.value as 'en' | 'fr')}
          className={`h-8 rounded-full border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring ${compact ? 'px-2.5' : 'pl-7 pr-2.5'}`}
        >
          <option value="fr">FR</option>
          <option value="en">EN</option>
        </select>
      </div>
    </div>
  )
}
