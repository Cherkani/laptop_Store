import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
  ChevronDown,
  Phone,
  MessageCircle,
  Heart,
  LayoutDashboard,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { authService } from '@/features/auth/services/authService'
import { useCartStore } from '@/store/cartStore'
import { toast } from '@/hooks/use-toast'
import { SitePreferences } from '@/components/layout/SitePreferences'
import { useI18n } from '@/contexts/i18n'

const WINDOWS_BRANDS = ['ASUS', 'Dell', 'HP', 'Lenovo', 'MSI', 'Acer', 'Razer']
const MAC_BRANDS = ['MacBook Air', 'MacBook Pro']

const WHATSAPP_NUMBER = '+212 6 12 34 56 78'
const HOURS = 'Lun - Sam · 9h00 - 20h00'

function isTypingElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select'
}

export function Header() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { toggleCart, getTotalItems } = useCartStore()
  const { t } = useI18n()

  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [openMega, setOpenMega] = useState<'windows' | 'mac' | null>(null)

  const desktopSearchRef = useRef<HTMLInputElement | null>(null)
  const mobileSearchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setIsUserMenuOpen(false)
        setOpenMega(null)
        return
      }

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingElement(event.target)) {
        event.preventDefault()
        if (window.innerWidth < 1024) {
          setIsMenuOpen(true)
          window.setTimeout(() => mobileSearchRef.current?.focus(), 40)
        } else {
          desktopSearchRef.current?.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const totalItems = getTotalItems()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setIsMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast({ title: t('user.signOut') })
      navigate('/')
    } catch {
      toast({ title: 'Failed to log out', variant: 'destructive' })
    }
    setIsUserMenuOpen(false)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-slate-200 bg-white/90 text-slate-900 backdrop-blur-xl transition-shadow',
        scrolled && 'shadow-[0_10px_28px_rgba(0,0,0,0.08)]',
      )}
    >
      {/* Top info bar */}
      <div className="border-b border-slate-200 bg-[#f8f9fa] text-slate-800">
        <div className="mx-auto flex max-w-[1260px] items-center gap-4 px-4 py-2 text-[13px] sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 ring-1 ring-emerald-200">
            <Phone className="h-3.5 w-3.5" />
            <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-emerald-900">
              WhatsApp {WHATSAPP_NUMBER}
            </a>
          </div>
          <span className="hidden items-center gap-2 text-slate-500 sm:flex">
            <span className="h-1 w-1 rounded-full bg-slate-400" />
            {HOURS}
          </span>
          <span className="ml-auto text-xs font-semibold text-[#e63946]">
            {t('header.promo') ?? 'Jusqu’à -30% sur une sélection reconditionnée'}
          </span>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-3 lg:h-[72px]">
          <Link to="/" className="flex items-center gap-2.5 shrink-0 text-slate-900">
            <span className="inline-block h-8 w-8 rounded-md bg-gradient-to-br from-[#0f5dcf] via-[#1445a6] to-[#0c1d3a] ring-2 ring-blue-200" aria-hidden="true" />
            <span className="font-display text-lg font-bold tracking-tight">TechFiable</span>
          </Link>

          <nav className="ml-6 hidden items-center gap-4 lg:flex text-slate-900">
            {[
              { label: 'Windows', key: 'windows' as const, brands: WINDOWS_BRANDS, href: '/products?os=Windows' },
              { label: 'Mac', key: 'mac' as const, brands: MAC_BRANDS, href: '/products?os=macOS' },
            ].map(item => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => setOpenMega(item.key)}
                onMouseLeave={() => setOpenMega(null)}
              >
                <button
                  className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  onClick={() => setOpenMega(prev => (prev === item.key ? null : item.key))}
                >
                  {item.key === 'windows' ? 'PC Windows' : 'Mac & MacBook'}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {openMega === item.key && (
                  <div className="absolute left-0 top-full mt-2 w-[360px] rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Marques</p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {item.brands.map(brand => (
                          <Link
                            key={brand}
                            to={`/products?os=${item.key === 'windows' ? 'Windows' : 'macOS'}&brand=${encodeURIComponent(brand.replace('MacBook ', 'Apple'))}`}
                            className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-800 ring-1 ring-slate-200 hover:bg-white"
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] font-bold text-slate-900 ring-1 ring-slate-200">
                              {item.key === 'mac' ? '' : brand.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="truncate">{brand}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link
                          to={item.href}
                          className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-[#e63946] to-[#ff6b35] px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-red-400/20"
                        >
                          Voir tout {item.key === 'windows' ? 'Windows' : 'Mac'}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <Link to="/products?sortBy=newest" className="text-sm font-semibold text-slate-900 hover:text-[#0f5dcf]">
              Nouveautés
            </Link>
            <Link to="/products?brand=Apple" className="text-sm font-semibold text-slate-900 hover:text-[#0f5dcf]">
              Promotions
            </Link>
            <Link to="/products" className="text-sm font-semibold text-slate-900 hover:text-[#0f5dcf]">
              Marques
            </Link>
            <Link to="/products" className="text-sm font-semibold text-slate-900 hover:text-[#0f5dcf]">
              À propos
            </Link>
          </nav>

          <form onSubmit={handleSearch} className="ml-auto hidden w-full max-w-xl lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                ref={desktopSearchRef}
                type="search"
                placeholder="Chercher par marque, modèle, CPU..."
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="h-11 rounded-full border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#0f5dcf]"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-slate-900 hover:bg-slate-100"
              onClick={toggleCart}
              aria-label={t('header.cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e63946] text-[11px] font-semibold text-white">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-slate-900 hover:bg-slate-100"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>

            <div className="hidden lg:block">
              <SitePreferences compact />
            </div>

            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUserMenuOpen(value => !value)}
                  aria-label="User menu"
                  className="text-slate-900 hover:bg-slate-100"
                >
                  <User className="h-5 w-5" />
                </Button>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/30">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <p className="truncate text-sm font-medium text-slate-900">{user.email}</p>
                        {isAdmin && <p className="mt-0.5 text-xs font-semibold text-emerald-600">{t('user.administrator')}</p>}
                      </div>
                      <div className="py-1.5 text-slate-900">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            {t('user.adminDashboard')}
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          {t('user.signOut')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-1 sm:flex text-slate-900">
                <Button variant="ghost" size="sm" asChild className="rounded-full text-slate-900 hover:bg-slate-100">
                  <Link to="/login">{t('auth.signIn')}</Link>
                </Button>
                <Button size="sm" asChild className="rounded-full bg-[#0f5dcf] hover:bg-[#0d4fb6] text-white shadow-md shadow-blue-500/20">
                  <Link to="/signup">{t('auth.signUp')}</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-slate-900 hover:bg-slate-100 lg:hidden"
              onClick={() => setIsMenuOpen(value => !value)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-200 py-4 lg:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  ref={mobileSearchRef}
                  type="search"
                  placeholder={t('header.search')}
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  className="h-11 rounded-full border-slate-200 bg-white pl-10 pr-4 text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </form>

            <div className="mb-3">
              <SitePreferences />
            </div>

            <nav className="flex flex-col gap-1 text-slate-900">
              <Link to="/" className="rounded-xl px-3 py-2 text-sm hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>
                {t('nav.store')}
              </Link>
              <Link to="/products" className="rounded-xl px-3 py-2 text-sm hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>
                Laptops
              </Link>
              <Link to="/products?os=Windows" className="rounded-xl px-3 py-2 text-sm hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>
                Windows
              </Link>
              <Link to="/products?os=macOS" className="rounded-xl px-3 py-2 text-sm hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>
                macOS
              </Link>
              <Link to="/products?sortBy=newest" className="rounded-xl px-3 py-2 text-sm hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>
                Nouveautés
              </Link>
              <Link to="/products" className="rounded-xl px-3 py-2 text-sm hover:bg-white/5" onClick={() => setIsMenuOpen(false)}>
                Promotions
              </Link>
              {!user && (
                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" className="flex-1 rounded-full bg-white/5 text-white" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/login">{t('auth.signIn')}</Link>
                  </Button>
                  <Button className="flex-1 rounded-full bg-[#0f5dcf] hover:bg-[#0d4fb6] text-white" asChild onClick={() => setIsMenuOpen(false)}>
                    <Link to="/signup">{t('auth.signUp')}</Link>
                  </Button>
                </div>
              )}
            </nav>

              <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-800">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Commander sur WhatsApp</p>
                  <p className="text-xs text-slate-500">Réponse rapide {HOURS}</p>
                </div>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white"
                >
                  Discuter
                </a>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
