import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Laptop, Eye, EyeOff, Loader2, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '../services/authService'
import { toast } from '@/hooks/use-toast'

export function SignupForm() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password.length < 6) {
      toast({
        title: 'Password must be at least 6 characters',
        variant: 'destructive',
      })
      return
    }
    setIsLoading(true)
    try {
      await authService.signup(formData)
      toast({
        title: 'Account created!',
        description: 'Welcome to TechFiable.',
        variant: 'default',
      })
      navigate('/')
    } catch (err) {
      toast({
        title: 'Signup failed',
        description:
          err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    'Track orders and deliveries',
    'Save favorites and wishlists',
    'Exclusive member-only deals',
    'Priority customer support',
  ]

  return (
    <div className="min-h-screen flex bg-surface-base">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#1d1d1f] items-center justify-center overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute bottom-1/3 left-0 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl" />
          <div className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md px-12 text-center">
          <div className="mx-auto mb-8 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto object-contain" />
          </div>
          <h2 className="text-4xl font-bold text-on-surface tracking-tight mb-4">
            Join TechFiable.
          </h2>
          <p className="text-lg text-gray-400 leading-relaxed mb-10">
            Create your account and unlock a premium laptop shopping experience.
          </p>

          {/* Benefits list */}
          <div className="space-y-4 text-left">
            {benefits.map(benefit => (
              <div
                key={benefit}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-muted/50 border border-border-faint"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Laptop className="w-5 h-5 text-on-surface" />
            </div>
            <span className="text-xl font-bold text-[#1d1d1f]">
              TechFiable
            </span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-[#1d1d1f] tracking-tight">
              Create account
            </h1>
            <p className="text-gray-500">
              Get started with your free TechFiable account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-[#1d1d1f]"
              >
                Full name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={e =>
                  setFormData(p => ({ ...p, fullName: e.target.value }))
                }
                required
                className="h-12 rounded-xl border-gray-200 bg-gray-50/50 px-4 text-[15px] focus:bg-white focus:border-blue-600 focus:ring-blue-600/20 transition-colors"
              />
            </div>

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
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={e =>
                    setFormData(p => ({ ...p, password: e.target.value }))
                  }
                  required
                  minLength={6}
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
              {formData.password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        formData.password.length >= 8
                          ? 'w-full bg-emerald-500'
                          : formData.password.length >= 6
                            ? 'w-2/3 bg-amber-500'
                            : 'w-1/3 bg-red-400'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-gray-400">
                    {formData.password.length >= 8
                      ? 'Strong'
                      : formData.password.length >= 6
                        ? 'Good'
                        : 'Weak'}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-[15px] font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/25 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Creating
                  account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
