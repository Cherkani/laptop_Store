import { useMemo, useState, type ComponentType } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  CalendarCheck,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorCog,
  Package,
  SlidersHorizontal,
  Store,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { authService } from '@/features/auth/services/authService'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { SitePreferences } from '@/components/layout/SitePreferences'
import { useI18n } from '@/contexts/i18n'

type NavItem = {
  to: string
  labelKey: string
  icon: ComponentType<{ className?: string }>
  exact: boolean
  matchPaths?: string[]
  description: { fr: string; en: string }
}

type NavGroup = {
  id: string
  labelKey: string
  description: { fr: string; en: string }
  items: NavItem[]
}

const navGroupsData: NavGroup[] = [
  {
    id: 'pilotage',
    labelKey: 'admin.group.pilotage',
    description: {
      fr: 'Suivi des KPI et rapports',
      en: 'KPI tracking and reporting',
    },
    items: [
      {
        to: '/admin',
        labelKey: 'admin.nav.dashboard',
        icon: LayoutDashboard,
        exact: true,
        description: {
          fr: 'Vue globale de vos KPI',
          en: 'Global KPI overview',
        },
      },
      {
        to: '/admin/reports',
        labelKey: 'admin.nav.reports',
        icon: BarChart3,
        exact: true,
        description: {
          fr: 'Analyses et exports',
          en: 'Analytics and exports',
        },
      },
      {
        to: '/admin/monitoring',
        labelKey: 'admin.nav.monitoring',
        icon: Activity,
        exact: true,
        description: {
          fr: 'Clics et produits les plus vus',
          en: 'Clicks and most viewed products',
        },
      },
    ],
  },
  {
    id: 'catalog',
    labelKey: 'admin.group.catalog',
    description: {
      fr: 'Gestion des produits et du stock',
      en: 'Products and stock management',
    },
    items: [
      {
        to: '/admin/daily',
        labelKey: 'admin.nav.daily',
        icon: CalendarCheck,
        exact: true,
        description: {
          fr: 'Checklist et activité du jour',
          en: 'Daily checklist and activity',
        },
      },
      {
        to: '/admin/products',
        labelKey: 'admin.nav.products',
        icon: Package,
        exact: false,
        matchPaths: ['/admin/products', '/admin/inventory'],
        description: {
          fr: 'Gestion produits et stock',
          en: 'Product management and stock',
        },
      },
    ],
  },
  {
    id: 'settings',
    labelKey: 'admin.group.settings',
    description: {
      fr: 'Configuration de la plateforme',
      en: 'Platform configuration',
    },
    items: [
      {
        to: '/admin/parametres',
        labelKey: 'admin.nav.settings',
        icon: SlidersHorizontal,
        exact: true,
        description: {
          fr: 'Paramètres métier',
          en: 'Business settings',
        },
      },
      {
        to: '/admin/systeme',
        labelKey: 'admin.nav.system',
        icon: MonitorCog,
        exact: true,
        description: {
          fr: 'Intégrations système',
          en: 'System integrations',
        },
      },
    ],
  },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { t, locale } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to: string, exact: boolean) => {
    const [path] = to.split('?')
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path) && path !== '/admin'
  }

  const isItemActive = (item: NavItem) => {
    if (item.matchPaths?.some(path => location.pathname.startsWith(path))) return true
    return isActive(item.to, item.exact)
  }

  const activeEntry = useMemo(() => {
    for (const group of navGroupsData) {
      for (const item of group.items) {
        if (isItemActive(item)) {
          return { group, item }
        }
      }
    }
    return { group: navGroupsData[0], item: navGroupsData[0].items[0] }
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast({ title: t('admin.logout') })
      navigate('/')
    } catch {
      toast({ title: 'Failed to log out', variant: 'destructive' })
    }
  }

  const renderNav = (mode: 'desktop' | 'mobile') => (
    <>
      <div className="px-5 py-5 border-b border-border-subtle">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
          <div>
            <p className="text-sm font-bold text-on-surface leading-none">TechFiable Pro</p>
            <p className="text-xs text-on-surface-faint mt-0.5">
              {locale === 'fr' ? 'Espace administrateur' : 'Admin workspace'}
            </p>
          </div>
        </Link>
      </div>

      <div className="px-4 py-4 border-b border-border-subtle">
        <SitePreferences className="justify-between" />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navGroupsData.map(group => (
          <div key={group.id} className="space-y-1.5">
            <p className="px-2.5 text-[10px] uppercase tracking-[0.22em] text-on-surface-faint font-semibold">
              {t(group.labelKey)}
            </p>
            {group.items.map(item => {
              const active = isItemActive(item)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => mode === 'mobile' && setMobileOpen(false)}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all border',
                    active
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-on-surface border-transparent shadow-md shadow-cyan-700/20'
                      : 'text-on-surface-subtle bg-transparent border-transparent hover:border-border-faint hover:bg-surface-overlay hover:text-on-surface',
                  )}
                >
                  <div
                    className={cn(
                      'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                      active ? 'bg-white/15' : 'bg-surface-sunken text-on-surface-faint group-hover:text-on-surface-subtle',
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={cn('font-medium truncate', active ? 'text-white' : 'text-on-surface')}>
                      {t(item.labelKey)} · {item.description[locale]}
                    </p>
                  </div>
                  <ChevronRight className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-white/90' : 'text-on-surface-faint')} />
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-border-subtle space-y-1">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-subtle hover:text-on-surface hover:bg-surface-overlay transition-colors"
          onClick={() => mode === 'mobile' && setMobileOpen(false)}
        >
          <Store className="h-4 w-4" />
          {t('admin.viewStore')}
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-subtle hover:text-red-400 hover:bg-surface-overlay transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t('admin.logout')}
        </button>
        <div className="px-3 pt-3 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-on-surface text-xs font-bold shrink-0">
            {(profile?.full_name ?? 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-on-surface truncate">{profile?.full_name ?? 'Admin'}</p>
            <p className="text-xs text-on-surface-subtle">{t('user.administrator')}</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-80 bg-surface-raised text-on-surface-subtle flex-col shrink-0 border-r border-border-faint">
        {renderNav('desktop')}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 h-full w-[88vw] max-w-sm bg-surface-raised text-on-surface-subtle border-r border-border-faint flex flex-col">
            {renderNav('mobile')}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col bg-surface-base">
        <header className="sticky top-0 z-30 border-b border-border-faint bg-surface-base/95 backdrop-blur">
          <div className="px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              <button
                className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border-faint bg-surface-raised text-on-surface-subtle hover:text-on-surface"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-4.5 w-4.5" />
              </button>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-on-surface-faint font-semibold truncate">
                  {t(activeEntry.group.labelKey)}
                </p>
                <h2 className="text-base lg:text-lg font-semibold text-on-surface truncate">
                  {t(activeEntry.item.labelKey)}
                </h2>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-on-surface-faint">
                {new Date().toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              <p className="text-xs text-on-surface-subtle">{activeEntry.item.description[locale]}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {mobileOpen && (
        <button
          aria-label="Close menu"
          className="lg:hidden fixed top-3 right-3 z-[60] h-9 w-9 rounded-lg border border-border-faint bg-surface-raised text-on-surface-subtle flex items-center justify-center"
          onClick={() => setMobileOpen(false)}
        >
          <X className="h-4.5 w-4.5" />
        </button>
      )}
    </div>
  )
}
