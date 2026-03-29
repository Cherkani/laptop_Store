import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
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

function isTypingElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return (
    target.isContentEditable ||
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select'
  )
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

  const desktopSearchRef = useRef<HTMLInputElement | null>(null)
  const mobileSearchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setIsUserMenuOpen(false)
        return
      }

      if (
        event.key === '/' &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !isTypingElement(event.target)
      ) {
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
        'sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl transition-shadow',
        scrolled && 'shadow-[0_10px_24px_rgba(15,23,42,0.14)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)]',
      )}
    >
      <div className="hidden border-b border-border bg-gradient-to-r from-sky-50 to-cyan-50 text-slate-600 dark:from-slate-900 dark:to-slate-900 dark:text-slate-300 md:block">
        <div className="mx-auto max-w-[1260px] px-6 py-2 text-xs">
          {t('header.promo')}
        </div>
      </div>

      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-3 sm:h-16">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span
              className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700"
              aria-hidden="true"
            />
            <span className="font-display text-[15px] font-bold tracking-tight text-foreground sm:text-base">
              LaptopStore
            </span>
          </Link>

          <nav className="ml-5 hidden items-center gap-6 md:flex">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              {t('nav.store')}
            </Link>
            <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground">
              {t('nav.laptops')}
            </Link>
            <Link to="/products?sortBy=newest" className="text-sm text-muted-foreground hover:text-foreground">
              {t('nav.newArrivals')}
            </Link>
          </nav>

          <form onSubmit={handleSearch} className="ml-auto hidden w-full max-w-sm lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={desktopSearchRef}
                type="search"
                placeholder={t('header.search')}
                title={t('header.searchHint')}
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="h-9 rounded-full border-border bg-background/90 pl-9 text-sm"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-3">
            <div className="hidden lg:block">
              <SitePreferences compact />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground hover:bg-accent"
              onClick={toggleCart}
              aria-label={t('header.cart')}
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Button>

            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUserMenuOpen(value => !value)}
                  aria-label="User menu"
                  className="text-foreground hover:bg-accent"
                >
                  <User className="h-5 w-5" />
                </Button>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                      <div className="border-b border-border px-4 py-3">
                        <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
                        {isAdmin && (
                          <p className="mt-0.5 text-xs font-semibold text-primary">{t('user.administrator')}</p>
                        )}
                      </div>
                      <div className="py-1.5">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            {t('user.adminDashboard')}
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
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
                  className="rounded-full text-foreground hover:bg-accent"
                >
                  <Link to="/login">{t('auth.signIn')}</Link>
                </Button>
                <Button size="sm" asChild className="rounded-full bg-primary hover:bg-primary/90">
                  <Link to="/signup">{t('auth.signUp')}</Link>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent md:hidden"
              onClick={() => setIsMenuOpen(value => !value)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={mobileSearchRef}
                  type="search"
                  placeholder={t('header.search')}
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  className="h-10 rounded-full border-border bg-background/90 pl-9"
                />
              </div>
            </form>

            <div className="mb-3">
              <SitePreferences />
            </div>

            <nav className="flex flex-col gap-1">
              <Link
                to="/"
                className="rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.store')}
              </Link>
              <Link
                to="/products"
                className="rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.laptops')}
              </Link>
              <Link
                to="/products?sortBy=newest"
                className="rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.newArrivals')}
              </Link>
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth.signIn')}
                  </Link>
                  <Link
                    to="/signup"
                    className="rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('auth.signUp')}
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
