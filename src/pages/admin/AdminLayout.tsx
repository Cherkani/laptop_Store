import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, Plus, LogOut, Laptop, ChevronRight, BarChart3, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { authService } from '@/features/auth/services/authService'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/features/auth/hooks/useAuth'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products', label: 'Products', icon: Package, exact: false },
      { to: '/admin/products?action=new', label: 'Add Product', icon: Plus, exact: false },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/inventory', label: 'Inventory', icon: Layers, exact: true },
      { to: '/admin/reports', label: 'Reports', icon: BarChart3, exact: true },
    ],
  },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile } = useAuth()

  const isActive = (to: string, exact: boolean) => {
    const [path] = to.split('?')
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path) && path !== '/admin'
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast({ title: 'Logged out' })
      navigate('/')
    } catch {
      toast({ title: 'Failed to log out', variant: 'destructive' })
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col shrink-0 overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">LaptopStore</p>
              <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-3 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive(item.to, item.exact)
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-700 space-y-0.5">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
            View Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <div className="px-3 pt-3 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(profile?.full_name ?? 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">{profile?.full_name ?? 'Admin'}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
