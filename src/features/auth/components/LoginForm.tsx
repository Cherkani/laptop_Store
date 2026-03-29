import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Laptop, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '../services/authService'
import { toast } from '@/hooks/use-toast'

export function LoginForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await authService.login(formData)
      toast({ title: 'Welcome back!', variant: 'default' })
      navigate('/')
    } catch (err) {
      toast({
        title: 'Login failed',
        description: err instanceof Error ? err.message : 'Invalid credentials',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1d1d1f] items-center justify-center overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md px-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-8">
            <Laptop className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4">
            Welcome back.
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed">
            Sign in to access your account, track orders, and discover the
            latest premium laptops.
          </p>

          {/* Floating cards */}
          <div className="mt-12 space-y-3">
            {['MacBook Pro M4', 'Dell XPS 16', 'ThinkPad X1 Carbon'].map(
              (name, i) => (
                <div
                  key={name}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur"
                  style={{ opacity: 1 - i * 0.15 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Laptop className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="text-xs text-gray-500">Premium Collection</p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1d1d1f]">
              LaptopStore
            </span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">
              Sign in
            </h1>
            <p className="text-gray-500">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-[#1d1d1f]"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e =>
                  setFormData(p => ({ ...p, email: e.target.value }))
                }
                required
                autoComplete="email"
                className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-blue-600/20 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-[#1d1d1f]"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={e =>
                    setFormData(p => ({ ...p, password: e.target.value }))
                  }
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4 pr-12 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-blue-600/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-[15px] font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/25 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Signing
                  in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
