import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Banknote,
  BarChart3,
  Building2,
  ChevronRight,
  ClipboardList,
  FileText,
  Laptop,
  Layers,
  LayoutDashboard,
  LogOut,
  Package,
  PiggyBank,
  Plus,
  Receipt,
  Settings2,
  ShoppingBag,
  SlidersHorizontal,
  Truck,
  Users,
  Wallet,
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
      { to: '/admin/systeme', labelKey: 'admin.nav.system', icon: Settings2, exact: true },
      { to: '/admin/parametres', labelKey: 'admin.nav.settings', icon: SlidersHorizontal, exact: true },
    ],
  },
  {
    labelKey: 'admin.group.commercial',
    items: [
      { to: '/admin/ventes', labelKey: 'admin.nav.sales', icon: ShoppingBag, exact: true },
      { to: '/admin/devis', labelKey: 'admin.nav.quotes', icon: FileText, exact: true },
      { to: '/admin/factures', labelKey: 'admin.nav.invoices', icon: Receipt, exact: true },
      { to: '/admin/bons-livraison', labelKey: 'admin.nav.delivery', icon: ClipboardList, exact: true },
      { to: '/admin/paiements', labelKey: 'admin.nav.payments', icon: Wallet, exact: true },
    ],
  },
  {
    labelKey: 'admin.group.crm',
    items: [
      { to: '/admin/clients', labelKey: 'admin.nav.clients', icon: Users, exact: true },
      { to: '/admin/entreprises', labelKey: 'admin.nav.companies', icon: Building2, exact: true },
      { to: '/admin/fournisseurs', labelKey: 'admin.nav.suppliers', icon: Truck, exact: true },
      { to: '/admin/cash', labelKey: 'admin.nav.cashSales', icon: Banknote, exact: true },
      { to: '/admin/treasury', labelKey: 'admin.nav.treasury', icon: PiggyBank, exact: true },
    ],
  },
  {
    labelKey: 'admin.group.catalog',
    items: [
      { to: '/admin/products', labelKey: 'admin.nav.products', icon: Package, exact: false },
      { to: '/admin/products?action=new', labelKey: 'admin.nav.addProduct', icon: Plus, exact: false },
      { to: '/admin/inventory', labelKey: 'admin.nav.stock', icon: Layers, exact: true },
      { to: '/admin/reports', labelKey: 'admin.nav.reports', icon: BarChart3, exact: true },
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
      <aside className="w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-300 flex flex-col shrink-0 overflow-y-auto border-r border-slate-800/50">
        <div className="px-5 py-5 border-b border-slate-800/70">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/30">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">TechFiable Pro</p>
              <p className="text-xs text-slate-400 mt-0.5">Admin Backoffice</p>
            </div>
          </Link>
        </div>

        <div className="px-3 py-3 border-b border-slate-800/70">
          <SitePreferences className="justify-between" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5">
          {navGroupsData.map(group => (
            <div key={group.labelKey}>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500 font-semibold px-3 mb-2">
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
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-700/30'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/90',
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

        <div className="px-3 py-4 border-t border-slate-800/70 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
            {t('admin.viewStore')}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:text-red-300 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t('admin.logout')}
          </button>
          <div className="px-3 pt-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(profile?.full_name ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{profile?.full_name ?? 'Admin'}</p>
              <p className="text-xs text-slate-500">{t('user.administrator')}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#f5f7fb] via-[#f8fafc] to-[#eef3fb] dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <Outlet />
      </main>
    </div>
  )
}
