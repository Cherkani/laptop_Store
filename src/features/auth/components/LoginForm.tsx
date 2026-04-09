import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Truck, Headphones } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '../services/authService'
import { toast } from '@/hooks/use-toast'

const TRUST = [
  { icon: ShieldCheck, label: 'Garantie 6 mois', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { icon: Truck,       label: 'Livraison rapide', color: 'text-amber-500',   bg: 'bg-amber-500/10'   },
  { icon: Headphones,  label: 'Support WhatsApp', color: 'text-sky-500',     bg: 'bg-sky-500/10'     },
]

export function LoginForm() {
  const navigate = useNavigate()
  const [isLoading,    setIsLoading]    = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData,     setFormData]     = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const data = await authService.login(formData)
      if (!data.user) throw new Error('Aucun utilisateur retourné.')
      toast({ title: 'Bienvenue !', variant: 'default' })
      navigate('/')
    } catch (err: unknown) {
      // Supabase throws AuthError objects with a .message property
      const message =
        err instanceof Error ? err.message :
        typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Identifiants invalides'

      const friendly =
        message.toLowerCase().includes('invalid login') || message.toLowerCase().includes('invalid credentials')
          ? 'Email ou mot de passe incorrect.'
          : message.toLowerCase().includes('email not confirmed')
          ? 'Veuillez confirmer votre email avant de vous connecter.'
          : message.toLowerCase().includes('too many requests')
          ? 'Trop de tentatives. Réessayez dans quelques minutes.'
          : message

      toast({ title: 'Connexion échouée', description: friendly, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f5f7fa]">

      {/* ── Left: full-bleed image panel ── */}
      <div className="hidden lg:flex lg:w-[52%] relative items-end justify-start overflow-hidden">
        <img
          src="/first%20backgroubd1.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient: dark bottom for text legibility, slight left fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Amber glow */}
        <div className="pointer-events-none absolute -bottom-24 left-10 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />

        <div className="relative z-10 w-full px-12 pb-14 space-y-5">
          <img src="/logo.png" alt="Casaby Tech" className="h-14 w-auto object-contain" />
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
              Espace client
            </p>
            <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-white">
              La boutique laptop<br />de confiance.
            </h2>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              Suivez vos commandes, gardez vos favoris et accédez aux offres pros.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {['MacBook Pro', 'Dell XPS', 'ThinkPad', 'ASUS ROG'].map(name => (
              <span
                key={name}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-sm"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex flex-1 items-center justify-center px-5 py-14 bg-white">
        <div className="w-full max-w-[400px]">

          {/* Logo */}
          <div className="mb-10">
            <img src="/logo.png" alt="Casaby Tech" className="h-16 w-auto object-contain" />
            <p className="mt-2 text-xs text-gray-400 tracking-wide">Accès sécurisé</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-[2rem] font-extrabold tracking-tight text-gray-900 leading-tight">
              Connexion
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Identifiez-vous pour retrouver vos commandes et favoris.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
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
                className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Mot de passe
                </Label>
                <a href="#" className="text-xs text-amber-500 hover:text-amber-600 font-medium transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                  className="h-12 rounded-xl border-gray-200 bg-gray-50 px-4 pr-12 text-[15px] text-gray-900 placeholder:text-gray-400 focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-[15px] font-bold text-[#0a0f1a] shadow-lg shadow-amber-500/25 transition hover:-translate-y-0.5 hover:bg-amber-400 hover:shadow-amber-400/30 active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Connexion...</>
              ) : (
                <>Se connecter <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">Pourquoi nous choisir</span>
            <div className="h-px flex-1 bg-gray-100" />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2.5">
            {TRUST.map(({ icon: Icon, label, color, bg }) => (
              <div
                key={label}
                className={`flex flex-col items-center gap-2 rounded-xl ${bg} px-2 py-3.5 text-center`}
              >
                <Icon className={`h-5 w-5 ${color}`} />
                <span className="text-[10px] font-semibold text-gray-600 leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Sign-up link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <Link to="/signup" className="font-semibold text-amber-500 hover:text-amber-600 transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
