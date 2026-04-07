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
import { CONTACT, WHATSAPP_URL, WINDOWS_BRANDS, MAC_BRANDS, BRAND_LOGOS } from '@/lib/constants'

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
        'sticky top-0 z-40 bg-background/95 text-foreground transition-shadow border-b border-border backdrop-blur-md',
        scrolled && 'shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
      )}
    >
      {/* Top info bar */}
      <div className="border-b border-border bg-muted/50">
        <div className="mx-auto flex max-w-[1260px] items-center gap-4 px-4 py-2 text-[13px] sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.05] px-3 py-1 text-foreground/70 ring-1 ring-foreground/10">
            <Phone className="h-3.5 w-3.5 text-emerald-400" />
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              WhatsApp {CONTACT.whatsappFormatted}
            </a>
          </div>
          <span className="hidden items-center gap-2 text-foreground/50 sm:flex">
            <span className="h-1 w-1 rounded-full bg-foreground/30" />
            {CONTACT.businessHours}
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
          <Link
            to="/"
            onClick={() => {
              window.location.href = '/'
            }}
            className="flex shrink-0 items-center gap-2.5 text-foreground"
          >
            <img
              src="/logo.png"
              alt="CASALAPTOPS logo"
              className="h-48 w-48 object-contain"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="ml-5 hidden items-center gap-1 lg:flex">
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
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[15px] font-semibold tracking-tight text-foreground transition hover:bg-foreground/10 hover:text-foreground"
                  onClick={() => setOpenMega(prev => (prev === item.key ? null : item.key))}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </button>

                {openMega === item.key && (
                  <div className="absolute left-0 top-full mt-1.5 w-[360px] overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-2xl shadow-black/30 backdrop-blur">
                    <div className="p-5">
                      <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.22em] text-foreground/45">
                        Marques {item.key === 'windows' ? 'PC Windows' : 'Mac & MacBook'}
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        {item.brands.map(brand => (
                          <Link
                            key={brand}
                            to={`/products?os=${item.key === 'windows' ? 'Windows' : 'macOS'}&brand=${encodeURIComponent(brand.replace('MacBook ', 'Apple'))}`}
                            className="group flex items-center gap-2 rounded-xl border border-border/70 bg-white/80 px-3.5 py-2.5 text-[14px] font-semibold text-foreground/80 transition hover:-translate-y-[1px] hover:border-amber-400/70 hover:bg-white hover:text-foreground shadow-sm"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.03]">
                              <img
                                src={BRAND_LOGOS[item.key === 'mac' ? 'Apple' : brand] ?? BRAND_LOGOS['Apple']}
                                alt={brand}
                                className="h-4.5 w-4.5 object-contain opacity-80"
                              />
                            </span>
                            <span className="truncate">{brand}</span>
                          </Link>
                        ))}
                      </div>
                      <Link
                        to={item.href}
                        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 py-3 text-sm font-bold tracking-tight text-[#0a0f1a] shadow-lg shadow-amber-500/25 transition hover:bg-amber-400"
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
              className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
            >
              Nouveautés
            </Link>
            <Link
              to="/products?sale=true"
              className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
            >
              Promotions
            </Link>
            <Link
              to="/products"
              className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
            >
              Marques
            </Link>
            <Link
              to="/products"
              className="rounded-full px-3 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
            >
            </Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="ml-auto hidden w-full max-w-sm lg:block xl:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
              <Input
                ref={desktopSearchRef}
                type="search"
                placeholder="Chercher par marque, modèle, CPU..."
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="h-10 rounded-full border-border bg-muted/50 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/30 focus-visible:ring-1 focus-visible:ring-amber-400/60"
              />
            </div>
          </form>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-1 lg:ml-3">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground/80 hover:bg-foreground/10 hover:text-foreground"
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
              className="text-foreground/80 hover:bg-foreground/10 hover:text-foreground"
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
                  className="text-foreground/80 hover:bg-foreground/10 hover:text-foreground"
                >
                  <User className="h-5 w-5" />
                </Button>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-black/30">
                      <div className="border-b border-border px-4 py-3">
                        <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
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
                            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/70 hover:bg-muted hover:text-foreground"
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
                  className="rounded-full text-foreground/80 hover:bg-foreground/10 hover:text-foreground"
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
              className="text-on-surface-muted hover:bg-muted hover:text-on-surface lg:hidden"
              onClick={() => setIsMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="border-t border-border py-4 lg:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30" />
                <Input
                  ref={mobileSearchRef}
                  type="search"
                  placeholder={t('header.search')}
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  className="h-11 rounded-full border-border bg-muted/50 pl-10 pr-4 text-foreground placeholder:text-foreground/30"
                />
              </div>
            </form>

            <div className="mb-3">
              <SitePreferences />
            </div>

            <nav className="flex flex-col gap-0.5">
              <Link
                to="/"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.store')}
              </Link>
              <Link
                to="/products"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Laptops
              </Link>
              <Link
                to="/products?os=Windows"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                PC Windows
              </Link>
              <Link
                to="/products?os=macOS"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Mac & MacBook
              </Link>
              <Link
                to="/products?sortBy=newest"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Nouveautés
              </Link>
              <Link
                to="/products?sale=true"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Promotions
              </Link>
              <Link
                to="/products"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
              </Link>

              {!user && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-full border border-border text-foreground/70 hover:bg-muted hover:text-foreground"
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
                <p className="font-semibold text-foreground">Commander sur WhatsApp</p>
                <p className="text-xs text-foreground/50">Réponse rapide · {CONTACT.businessHours}</p>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-on-surface hover:bg-emerald-400"
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
