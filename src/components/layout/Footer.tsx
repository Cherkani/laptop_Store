import { Link } from 'react-router-dom'
import { useI18n } from '@/contexts/i18n'
import { BRAND } from '@/lib/constants'

const footerLinks = {
  shop: [
    { key: 'footer.link.allLaptops', to: '/products' },
    { key: 'footer.link.macbooks', to: '/products?brand=Apple' },
    { key: 'footer.link.gaming', to: '/products?gpu=NVIDIA RTX' },
    { key: 'footer.link.business', to: '/products?brand=Dell&brand=Lenovo&brand=HP' },
  ],
  services: [
    { key: 'footer.link.shipping', to: '#' },
    { key: 'footer.link.returns', to: '#' },
    { key: 'footer.link.warranty', to: '#' },
    { key: 'footer.link.support', to: '#' },
  ],
  company: [
    { key: 'footer.link.about', to: '#' },
    { key: 'footer.link.contact', to: '#' },
    { key: 'footer.link.privacy', to: '#' },
    { key: 'footer.link.terms', to: '#' },
  ],
}

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border-faint bg-surface-sunken">
      <div className="mx-auto max-w-[1260px] px-4 sm:px-6 lg:px-8">
        <p className="border-b border-border-faint py-4 text-xs text-on-surface-faint sm:text-sm">
          {t('footer.disclaimer')}
        </p>

        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4 lg:py-12">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="font-display text-lg font-bold tracking-tight text-on-surface">
              {BRAND.shortName}
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-on-surface-subtle">
              {t('footer.about')}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-faint">{t('footer.shop')}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.shop.map(link => (
                <li key={link.key}>
                  <Link
                    to={link.to}
                    className="text-sm text-on-surface-subtle transition-colors hover:text-on-surface"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-faint">{t('footer.services')}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.services.map(link => (
                <li key={link.key}>
                  <a
                    href={link.to}
                    className="text-sm text-on-surface-subtle transition-colors hover:text-on-surface"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-faint">{t('footer.company')}</h3>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.company.map(link => (
                <li key={link.key}>
                  <a
                    href={link.to}
                    className="text-sm text-on-surface-subtle transition-colors hover:text-on-surface"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border-faint py-5 text-xs text-on-surface-faint sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} {BRAND.shortName}. {t('footer.rights')}</p>
          <p>{t('footer.tagline')}</p>
        </div>
      </div>
    </footer>
  )
}
