import { Link } from 'react-router-dom'

// Simple Icons CDN — official brand SVG logos
const brands = [
  {
    name: 'Apple',
    light: 'https://cdn.simpleicons.org/apple/111111',
    dark:  'https://cdn.simpleicons.org/apple/ffffff',
  },
  {
    name: 'Dell',
    light: 'https://cdn.simpleicons.org/dell/111111',
    dark:  'https://cdn.simpleicons.org/dell/ffffff',
  },
  {
    name: 'HP',
    light: 'https://cdn.simpleicons.org/hp/111111',
    dark:  'https://cdn.simpleicons.org/hp/ffffff',
  },
  {
    name: 'Lenovo',
    light: 'https://cdn.simpleicons.org/lenovo/111111',
    dark:  'https://cdn.simpleicons.org/lenovo/ffffff',
  },
  {
    name: 'ASUS',
    light: 'https://cdn.simpleicons.org/asus/111111',
    dark:  'https://cdn.simpleicons.org/asus/ffffff',
  },
  {
    name: 'MSI',
    light: 'https://cdn.simpleicons.org/msi/111111',
    dark:  'https://cdn.simpleicons.org/msi/ffffff',
  },
  {
    name: 'Acer',
    light: 'https://cdn.simpleicons.org/acer/111111',
    dark:  'https://cdn.simpleicons.org/acer/ffffff',
  },
  {
    name: 'Samsung',
    light: 'https://cdn.simpleicons.org/samsung/111111',
    dark:  'https://cdn.simpleicons.org/samsung/ffffff',
  },
]

export function BrandStrip() {
  return (
    <section className="border-y border-border-faint bg-surface-sunken py-3.5">
      <div className="overflow-hidden">
        <div className="group flex w-max animate-[marquee_22s_linear_infinite] gap-3 whitespace-nowrap hover:[animation-play-state:paused]">
          {[...brands, ...brands, ...brands].map((brand, idx) => (
            <Link
              key={`${brand.name}-${idx}`}
              to={`/products?brand=${encodeURIComponent(brand.name)}`}
              className="inline-flex h-10 min-w-[130px] items-center justify-center gap-2.5 rounded-full border border-border-subtle bg-surface-raised/60 px-4 text-xs font-semibold tracking-tight text-on-surface-muted transition-all duration-200 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-300"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                {/* Light mode logo */}
                <img
                  src={brand.light}
                  alt={brand.name}
                  className="h-4 w-4 object-contain opacity-70 transition-opacity duration-200 group-hover:opacity-100 dark:hidden"
                  loading="lazy"
                />
                {/* Dark mode logo */}
                <img
                  src={brand.dark}
                  alt={brand.name}
                  className="hidden h-4 w-4 object-contain opacity-70 transition-opacity duration-200 group-hover:opacity-100 dark:inline-block"
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
