import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarCheck,
  ChevronRight,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  Settings2,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { authService } from '@/features/auth/services/authService'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { SitePreferences } from '@/components/layout/SitePreferences'
import { useI18n } from '@/contexts/i18n'

const navGroupsData = [
  {
    labelKey: 'admin.group.pilotage',
    items: [
      { to: '/admin', labelKey: 'admin.nav.dashboard', icon: LayoutDashboard, exact: true },
      { to: '/admin/daily', labelKey: 'admin.nav.daily', icon: CalendarCheck, exact: true },
      { to: '/admin/reports', labelKey: 'admin.nav.reports', icon: BarChart3, exact: true },
    ],
  },
  {
    labelKey: 'admin.group.catalog',
    items: [
      { to: '/admin/products', labelKey: 'admin.nav.products', icon: Package, exact: false },
      { to: '/admin/inventory', labelKey: 'admin.nav.stock', icon: Layers, exact: true },
    ],
  },
  {
    labelKey: 'admin.group.settings',
    items: [
      { to: '/admin/parametres', labelKey: 'admin.nav.settings', icon: SlidersHorizontal, exact: true },
      { to: '/admin/systeme', labelKey: 'admin.nav.system', icon: Settings2, exact: true },
    ],
  },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { t } = useI18n()

  const isActive = (to: string, exact: boolean) => {
    const [path] = to.split('?')
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path) && path !== '/admin'
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast({ title: t('admin.logout') })
      navigate('/')
    } catch {
      toast({ title: 'Failed to log out', variant: 'destructive' })
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="w-72 bg-surface-raised text-on-surface-subtle flex flex-col shrink-0 overflow-y-auto border-r border-border-faint">
        <div className="px-5 py-5 border-b border-border-subtle">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain" />
            <div>
              <p className="text-sm font-bold text-on-surface leading-none">TechFiable Pro</p>
              <p className="text-xs text-on-surface-faint mt-0.5">Admin Backoffice</p>
            </div>
          </Link>
        </div>

        <div className="px-3 py-3 border-b border-border-subtle">
          <SitePreferences className="justify-between" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5">
          {navGroupsData.map(group => (
            <div key={group.labelKey}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-faint font-semibold px-3 mb-2">
                {t(group.labelKey)}
              </p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive(item.to, item.exact)
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-on-surface shadow-md shadow-cyan-700/30'
                        : 'text-on-surface-subtle hover:text-on-surface hover:bg-surface-overlay',
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {t(item.labelKey)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-border-subtle space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-on-surface-subtle hover:text-on-surface hover:bg-surface-overlay transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
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
      </aside>

      <main className="flex-1 overflow-y-auto bg-surface-base">
        <Outlet />
      </main>
    </div>
  )
}
