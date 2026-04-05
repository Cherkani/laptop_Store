import { Link } from 'react-router-dom'

const brands = [
  { name: 'Apple', logo: '' },
  { name: 'Dell', logo: 'DE' },
  { name: 'HP', logo: 'HP' },
  { name: 'Lenovo', logo: 'LE' },
  { name: 'ASUS', logo: 'AS' },
  { name: 'MSI', logo: 'MS' },
  { name: 'Acer', logo: 'AC' },
  { name: 'Samsung', logo: 'SA' },
]

export function BrandStrip() {
  return (
    <section className="bg-[#0f0f0f] py-4">
      <div className="mx-auto max-w-[1260px] overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="flex animate-[marquee_18s_linear_infinite] gap-4 whitespace-nowrap text-white [--marquee-width:220px]">
          {[...brands, ...brands].map((brand, idx) => (
            <Link
              key={`${brand.name}-${idx}`}
              to={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="group inline-flex h-12 min-w-[140px] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold tracking-tight shadow-[0_8px_20px_rgba(0,0,0,0.25)] transition hover:bg-white/15"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white ring-1 ring-white/10">
                {brand.logo}
              </span>
              <span className="text-white group-hover:text-orange-200">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <style>
        {`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        `}
      </style>
    </section>
  )
}
