import { Link } from 'react-router-dom'

// Simple Icons CDN — official brand SVG logos, white version via color param
const brands = [
  {
    name: 'Apple',
    logo: 'https://cdn.simpleicons.org/apple/ffffff',
  },
  {
    name: 'Dell',
    logo: 'https://cdn.simpleicons.org/dell/ffffff',
  },
  {
    name: 'HP',
    logo: 'https://cdn.simpleicons.org/hp/ffffff',
  },
  {
    name: 'Lenovo',
    logo: 'https://cdn.simpleicons.org/lenovo/ffffff',
  },
  {
    name: 'ASUS',
    logo: 'https://cdn.simpleicons.org/asus/ffffff',
  },
  {
    name: 'MSI',
    logo: 'https://cdn.simpleicons.org/msi/ffffff',
  },
  {
    name: 'Acer',
    logo: 'https://cdn.simpleicons.org/acer/ffffff',
  },
  {
    name: 'Samsung',
    logo: 'https://cdn.simpleicons.org/samsung/ffffff',
  },
]

export function BrandStrip() {
  return (
    <section className="border-y border-white/[0.06] bg-[#080d16] py-3.5">
      <div className="overflow-hidden">
        <div className="group flex w-max animate-[marquee_22s_linear_infinite] gap-3 whitespace-nowrap hover:[animation-play-state:paused]">
          {[...brands, ...brands, ...brands].map((brand, idx) => (
            <Link
              key={`${brand.name}-${idx}`}
              to={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="inline-flex h-10 min-w-[130px] items-center justify-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold tracking-tight text-white/80 transition-all duration-200 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-4 w-4 object-contain opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                  loading="lazy"
                />
              </span>
              {brand.name}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 3)); }
        }
      `}</style>
    </section>
  )
}
