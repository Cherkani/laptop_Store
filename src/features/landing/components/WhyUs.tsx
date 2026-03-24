import { Truck, RotateCcw, Headphones, Award, Zap, Star } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Free delivery on all orders over $999. Express shipping available.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: RotateCcw,
    title: '30-Day Returns',
    description: 'Not satisfied? Return your laptop within 30 days for a full refund.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: '24/7 technical support from our team of laptop specialists.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Star,
    title: 'Curated Selection',
    description: 'Every laptop is hand-picked and reviewed by our experts for quality.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: Award,
    title: 'Warranty Included',
    description: 'Every laptop comes with manufacturer warranty and our service guarantee.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: Zap,
    title: 'Top Performance',
    description: 'We only sell laptops tested for reliability and top performance.',
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
]

export function WhyUs() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">Why LaptopStore</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Everything You Need</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            We're committed to making your laptop buying experience exceptional, from browsing to delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(feature => (
            <div key={feature.title} className="flex gap-4">
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center shrink-0`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
