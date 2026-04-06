import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Laptop, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Truck, Headphones } from 'lucide-react'
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
    <div className="min-h-screen flex bg-[#0b101a] text-white">
      {/* Left inspirational panel */}
      <div className="hidden lg:flex lg:w-1/2 relative text-white items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/first%20backgroubd1.png"
            alt="Performance laptop"
            className="h-full w-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b101a] via-[#0b101a]/70 to-[#0b101a]/80" />
        </div>
        <div className="relative z-10 max-w-lg px-12 py-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
            <Laptop className="h-4 w-4" />
            Espace client
          </div>
          <h2 className="text-4xl font-bold leading-tight">Rejoignez la sélection premium.</h2>
          <p className="text-lg text-white/70 leading-relaxed">
            Suivez vos commandes, gardez vos favoris et accédez aux offres pros sur les laptops Windows et Mac reconditionnés.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {['MacBook Pro', 'Dell XPS', 'ThinkPad'].map((name, i) => (
              <div
                key={name}
                className="rounded-2xl bg-white/10 border border-white/10 p-3 backdrop-blur"
                style={{ opacity: 1 - i * 0.12 }}
              >
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-[11px] text-white/60">Reconditionné certifié</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl bg-[#0f1726] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5)] px-6 py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#0f5dcf] flex items-center justify-center text-white">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/60">TechFiable</p>
              <p className="text-xs text-white/50">Accès sécurisé</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">Connexion</h1>
            <p className="text-gray-500">Identifiez-vous pour retrouver vos commandes et vos favoris.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@email.com"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
                className="h-12 rounded-xl border-white/15 bg-white/5 px-4 text-[15px] focus:bg-[#0f1726] focus:border-amber-400 focus:ring-amber-400/30 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-white">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-white/15 bg-white/5 px-4 pr-12 text-[15px] focus:bg-[#0f1726] focus:border-amber-400 focus:ring-amber-400/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#0a0f1a] text-[15px] font-semibold shadow-lg shadow-amber-500/25 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-white/60">
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" /> Garantie 6 mois
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <Truck className="h-4 w-4 text-amber-300" /> Livraison rapide
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
              <Headphones className="h-4 w-4 text-amber-300" /> Support WhatsApp
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="text-amber-300 hover:text-amber-200 font-semibold transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
