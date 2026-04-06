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

const BRAND_LOGOS: Record<string, string> = {
  ASUS: 'https://cdn.simpleicons.org/asus/ffffff',
  Dell: 'https://cdn.simpleicons.org/dell/ffffff',
  HP: 'https://cdn.simpleicons.org/hp/ffffff',
  Lenovo: 'https://cdn.simpleicons.org/lenovo/ffffff',
  MSI: 'https://cdn.simpleicons.org/msi/ffffff',
  Acer: 'https://cdn.simpleicons.org/acer/ffffff',
  Razer: 'https://cdn.simpleicons.org/razer/ffffff',
  Apple: 'https://cdn.simpleicons.org/apple/ffffff',
}

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
        'sticky top-0 z-40 bg-[#0b101a]/95 text-slate-100 transition-shadow border-b border-white/[0.07] backdrop-blur-md',
        scrolled && 'shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
      )}
    >
      {/* Top info bar */}
      <div className="border-b border-white/[0.06] bg-[#070c15]">
        <div className="mx-auto flex max-w-[1260px] items-center gap-4 px-4 py-2 text-[13px] sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1 text-white/70 ring-1 ring-white/10">
            <Phone className="h-3.5 w-3.5 text-emerald-400" />
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              WhatsApp {WHATSAPP_NUMBER}
            </a>
          </div>
          <span className="hidden items-center gap-2 text-white/50 sm:flex">
            <span className="h-1 w-1 rounded-full bg-white/30" />
            {HOURS}
          </span>
          <span className="ml-auto rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
            {t('header.promo') ?? 'Premium laptops reconditionnés'}
          </span>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-3 lg:h-[68px]">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5 text-white">
            <span
              className="inline-block h-9 w-9 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
              aria-hidden="true"
            />
            <span className="font-display text-base font-extrabold tracking-tight text-white">
              LaptopStore.ma
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="ml-5 hidden items-center gap-0.5 lg:flex">
            {[
              {
                label: 'PC Windows',
                key: 'windows' as const,
                brands: WINDOWS_BRANDS,
                href: '/products?os=Windows',
              },
              {
                label: 'Mac & MacBook',
                key: 'mac' as const,
                brands: MAC_BRANDS,
                href: '/products?os=macOS',
              },
            ].map(item => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => setOpenMega(item.key)}
                onMouseLeave={() => setOpenMega(null)}
              >
                <button
                  className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
                  onClick={() => setOpenMega(prev => (prev === item.key ? null : item.key))}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </button>

                {openMega === item.key && (
                  <div className="absolute left-0 top-full mt-1.5 w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f1726] shadow-2xl shadow-black/60">
                    <div className="p-4">
                      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
                        Marques
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {item.brands.map(brand => (
                          <Link
                            key={brand}
                            to={`/products?os=${item.key === 'windows' ? 'Windows' : 'macOS'}&brand=${encodeURIComponent(brand.replace('MacBook ', 'Apple'))}`}
                            className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10">
                              <img
                                src={BRAND_LOGOS[item.key === 'mac' ? 'Apple' : brand] ?? BRAND_LOGOS['Apple']}
                                alt={brand}
                                className="h-4 w-4 object-contain opacity-70"
                              />
                            </span>
                            <span className="truncate">{brand}</span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        to={item.href}
                        className="mt-4 flex items-center justify-center rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-[#0a0f1a] shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
                      >
                        Voir tout {item.key === 'windows' ? 'Windows' : 'Mac'}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <Link
              to="/products?sortBy=newest"
              className="rounded-full px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Nouveautés
            </Link>
            <Link
              to="/products?sale=true"
              className="rounded-full px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Promotions
            </Link>
            <Link
              to="/products"
              className="rounded-full px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Marques
            </Link>
            <Link
              to="/products"
              className="rounded-full px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              À propos
            </Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="ml-auto hidden w-full max-w-sm lg:block xl:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <Input
                ref={desktopSearchRef}
                type="search"
                placeholder="Chercher par marque, modèle, CPU..."
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="h-10 rounded-full border-white/10 bg-white/[0.06] pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-amber-400/60"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-1 lg:ml-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white/80 hover:bg-white/10 hover:text-white"
              onClick={toggleCart}
              aria-label={t('header.cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:bg-white/10 hover:text-white"
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
                  onClick={() => setIsUserMenuOpen(v => !v)}
                  aria-label="User menu"
                  className="text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <User className="h-5 w-5" />
                </Button>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0f1726] shadow-2xl shadow-black/50">
                      <div className="border-b border-white/[0.07] px-4 py-3">
                        <p className="truncate text-sm font-medium text-white">{user.email}</p>
                        {isAdmin && (
                          <p className="mt-0.5 text-xs font-semibold text-emerald-400">
                            {t('user.administrator')}
                          </p>
                        )}
                      </div>
                      <div className="py-1.5">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            {t('user.adminDashboard')}
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
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
              <div className="hidden items-center gap-1 sm:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <Link to="/login">{t('auth.signIn')}</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="rounded-full bg-amber-500 text-[#0a0f1a] shadow-md shadow-amber-500/20 hover:bg-amber-400"
                >
                  <Link to="/signup">{t('auth.signUp')}</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:bg-white/10 hover:text-white lg:hidden"
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="border-t border-white/[0.07] py-4 lg:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                <Input
                  ref={mobileSearchRef}
                  type="search"
                  placeholder={t('header.search')}
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  className="h-11 rounded-full border-white/10 bg-white/[0.06] pl-10 pr-4 text-white placeholder:text-white/30"
                />
              </div>
            </form>

            <div className="mb-3">
              <SitePreferences />
            </div>

            <nav className="flex flex-col gap-0.5">
              <Link
                to="/"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.store')}
              </Link>
              <Link
                to="/products"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Laptops
              </Link>
              <Link
                to="/products?os=Windows"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                PC Windows
              </Link>
              <Link
                to="/products?os=macOS"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Mac & MacBook
              </Link>
              <Link
                to="/products?sortBy=newest"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Nouveautés
              </Link>
              <Link
                to="/products?sale=true"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Promotions
              </Link>
              <Link
                to="/products"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/[0.06] hover:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>

              {!user && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-full border border-white/10 text-white/70 hover:bg-white/[0.06] hover:text-white"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/login">{t('auth.signIn')}</Link>
                  </Button>
                  <Button
                    className="flex-1 rounded-full bg-amber-500 text-[#0a0f1a] hover:bg-amber-400"
                    asChild
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/signup">{t('auth.signUp')}</Link>
                  </Button>
                </div>
              )}
            </nav>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm">
              <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
              <div className="flex-1">
                <p className="font-semibold text-white">Commander sur WhatsApp</p>
                <p className="text-xs text-white/50">Réponse rapide · {HOURS}</p>
              </div>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-400"
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
