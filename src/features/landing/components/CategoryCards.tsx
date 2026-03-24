import { Link } from 'react-router-dom'
import { Gamepad2, Briefcase, GraduationCap, Palette } from 'lucide-react'

const categories = [
  {
    title: 'Gaming',
    description: 'High-performance gaming laptops with RTX graphics',
    icon: Gamepad2,
    color: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    href: '/products?gpu=NVIDIA RTX',
  },
  {
    title: 'Business',
    description: 'Professional laptops built for productivity',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    href: '/products?brand=Dell&brand=Lenovo&brand=HP',
  },
  {
    title: 'Student',
    description: 'Lightweight and affordable for academic life',
    icon: GraduationCap,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    href: '/products?priceMax=1000',
  },
  {
    title: 'Creative',
    description: 'Color-accurate displays for designers & editors',
    icon: Palette,
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    href: '/products?brand=Apple&brand=ASUS',
  },
]

export function CategoryCards() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Browse by Type</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Find What You Need</h2>
          <p className="text-muted-foreground mt-2">Curated collections for every use case</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <Link
              key={cat.title}
              to={cat.href}
              className="group relative overflow-hidden rounded-2xl border bg-white p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-4`}>
                <cat.icon className={`w-6 h-6 ${cat.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {cat.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{cat.description}</p>
              <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r ${cat.color} transition-all duration-300 group-hover:w-full`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
