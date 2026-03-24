import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Laptop, Search, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { authService } from '@/features/auth/services/authService'
import { useCartStore } from '@/store/cartStore'
import { toast } from '@/hooks/use-toast'

export function Header() {
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const { toggleCart, getTotalItems } = useCartStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const totalItems = getTotalItems()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast({ title: 'Logged out successfully' })
      navigate('/')
    } catch {
      toast({ title: 'Failed to log out', variant: 'destructive' })
    }
    setIsUserMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 hidden sm:block">LaptopStore</span>
          </Link>

          {/* Nav links - desktop */}
          <nav className="hidden md:flex items-center gap-6 ml-4">
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Laptops
            </Link>
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search laptops..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            {/* Cart button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={toggleCart}
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="User menu"
                >
                  <User className="h-5 w-5" />
                </Button>
                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border bg-background shadow-lg z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.email}</p>
                        {isAdmin && <p className="text-xs text-blue-600 font-medium">Administrator</p>}
                      </div>
                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search laptops..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
            </form>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm font-medium py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/products" className="text-sm font-medium py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Laptops</Link>
              {!user && (
                <>
                  <Link to="/login" className="text-sm font-medium py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Sign in</Link>
                  <Link to="/signup" className="text-sm font-medium py-2 hover:text-primary" onClick={() => setIsMenuOpen(false)}>Sign up</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
