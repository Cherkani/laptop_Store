import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Headphones } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-800/10 blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
              <Zap className="h-3.5 w-3.5" />
              New arrivals every week
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Find Your
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Perfect Laptop
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
              Explore our curated selection of premium laptops from top brands. Whether you're a gamer, creator, or professional — we have the right machine for you.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                <Link to="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur"
              >
                <Link to="/products?sortBy=newest">View New Arrivals</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-sm text-slate-400">Laptop Models</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">20+</p>
                <p className="text-sm text-slate-400">Top Brands</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50k+</p>
                <p className="text-sm text-slate-400">Happy Customers</p>
              </div>
            </div>
          </div>

          {/* Right - Visual element */}
          <div className="relative hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-lg">
              {/* Main laptop mockup */}
              <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-600/50">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl aspect-video flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center">
                      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm">LaptopStore</p>
                  </div>
                </div>
                <div className="mt-4 h-2 bg-slate-700 rounded-full" />
              </div>

              {/* Floating cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl p-4 shadow-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Performance</p>
                    <p className="text-sm font-semibold text-slate-900">Ultra Fast</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Warranty</p>
                    <p className="text-sm font-semibold text-slate-900">2 Years</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom features bar */}
      <div className="relative border-t border-white/10 bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Zap className="h-5 w-5 text-blue-400 shrink-0" />
              <span>Free same-day shipping on orders over $999</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Shield className="h-5 w-5 text-blue-400 shrink-0" />
              <span>30-day hassle-free returns</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <Headphones className="h-5 w-5 text-blue-400 shrink-0" />
              <span>Expert support 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
