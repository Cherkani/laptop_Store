import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Locale = 'en' | 'fr'

type Dict = Record<string, string>

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const STORAGE_KEY = 'laptopstore-locale'

const dictionaries: Record<Locale, Dict> = {
  en: {
    'header.promo': 'Free shipping on orders over $999. 30-day returns included.',
    'nav.store': 'Store',
    'nav.laptops': 'Laptops',
    'nav.newArrivals': 'New Arrivals',
    'header.search': 'Search laptops',
    'header.searchHint': 'Press / to focus search',
    'header.cart': 'Shopping cart',
    'auth.signIn': 'Sign in',
    'auth.signUp': 'Sign up',
    'user.administrator': 'Administrator',
    'user.adminDashboard': 'Admin Dashboard',
    'user.signOut': 'Sign out',
    'theme.toggle': 'Toggle theme',
    'lang.label': 'Language',
    'theme.light': 'Light',
    'theme.dark': 'Dark',

    'footer.disclaimer': 'Prices shown are for refurbished products and may vary based on configuration and availability.',
    'footer.about': 'Premium refurbished laptops with verified quality and dependable support.',
    'footer.shop': 'Shop',
    'footer.services': 'Services',
    'footer.company': 'Company',
    'footer.link.allLaptops': 'All Laptops',
    'footer.link.macbooks': 'MacBooks',
    'footer.link.gaming': 'Gaming Laptops',
    'footer.link.business': 'Business Picks',
    'footer.link.shipping': 'Shipping Info',
    'footer.link.returns': 'Returns',
    'footer.link.warranty': 'Warranty',
    'footer.link.support': 'Support',
    'footer.link.about': 'About',
    'footer.link.contact': 'Contact',
    'footer.link.privacy': 'Privacy Policy',
    'footer.link.terms': 'Terms',
    'footer.rights': 'All rights reserved.',
    'footer.tagline': 'Made for smarter, more sustainable laptop shopping.',

    'admin.group.pilotage': 'Control',
    'admin.group.commercial': 'Sales',
    'admin.group.catalog': 'Catalog',
    'admin.nav.dashboard': 'Dashboard',
    'admin.nav.system': 'System',
    'admin.nav.settings': 'Settings',
    'admin.nav.sales': 'Sales',
    'admin.nav.quotes': 'Quotes',
    'admin.nav.invoices': 'Invoices',
    'admin.nav.delivery': 'Delivery Notes',
    'admin.nav.payments': 'Payments',
    'admin.nav.products': 'Products',
    'admin.nav.addProduct': 'Add Product',
    'admin.nav.stock': 'Stock',
    'admin.nav.reports': 'Reports',
    'admin.viewStore': 'View Store',
    'admin.logout': 'Sign out',

    'product.notFoundTitle': 'Product not found',
    'product.notFoundDesc': "The laptop you're looking for doesn't exist or has been removed.",
    'product.browseAll': 'Browse all laptops',
    'product.quantity': 'Quantity',
    'product.available': 'available',
    'product.adding': 'Adding to cart...',
    'product.addToCart': 'Add to Cart',
    'product.whatsappOrder': 'Order via WhatsApp',
    'product.whatsappOpening': 'Opening WhatsApp...',
    'product.techSpecs': 'Technical Specifications',
    'product.backAll': 'Back to all laptops',
    'product.perk.shipping': 'Free express shipping',
    'product.perk.returns': '30-day hassle-free returns',
    'product.perk.warranty': '90-day warranty included',
    'toast.addedToCart': 'Added to cart',
    'toast.whatsappOpened': 'WhatsApp opened',
    'toast.leadSynced': 'Lead saved and synced to Google.',
    'toast.leadSavedOnly': 'Lead saved. Set Google webhook to sync externally.',
    'toast.whatsappSaveFail': 'WhatsApp opened, but CRM save failed',
    'toast.runMigration': 'Please run the latest database migration.',
  },
  fr: {
    'header.promo': 'Livraison offerte dès 999$. Retours sous 30 jours inclus.',
    'nav.store': 'Boutique',
    'nav.laptops': 'Ordinateurs',
    'nav.newArrivals': 'Nouveautés',
    'header.search': 'Rechercher un laptop',
    'header.searchHint': 'Appuyez sur / pour rechercher',
    'header.cart': 'Panier',
    'auth.signIn': 'Se connecter',
    'auth.signUp': "S'inscrire",
    'user.administrator': 'Administrateur',
    'user.adminDashboard': 'Tableau de bord admin',
    'user.signOut': 'Se déconnecter',
    'theme.toggle': 'Changer le thème',
    'lang.label': 'Langue',
    'theme.light': 'Clair',
    'theme.dark': 'Sombre',

    'footer.disclaimer': 'Les prix affichés concernent des produits reconditionnés et peuvent varier selon la configuration et la disponibilité.',
    'footer.about': 'Laptops reconditionnés premium avec qualité vérifiée et support fiable.',
    'footer.shop': 'Boutique',
    'footer.services': 'Services',
    'footer.company': 'Entreprise',
    'footer.link.allLaptops': 'Tous les laptops',
    'footer.link.macbooks': 'MacBooks',
    'footer.link.gaming': 'Laptops gaming',
    'footer.link.business': 'Sélection pro',
    'footer.link.shipping': 'Infos livraison',
    'footer.link.returns': 'Retours',
    'footer.link.warranty': 'Garantie',
    'footer.link.support': 'Support',
    'footer.link.about': 'À propos',
    'footer.link.contact': 'Contact',
    'footer.link.privacy': 'Confidentialité',
    'footer.link.terms': 'Conditions',
    'footer.rights': 'Tous droits réservés.',
    'footer.tagline': 'Pensé pour un achat laptop plus intelligent et durable.',

    'admin.group.pilotage': 'Pilotage',
    'admin.group.commercial': 'Commercial',
    'admin.group.catalog': 'Catalogue',
    'admin.nav.dashboard': 'Dashboard',
    'admin.nav.system': 'Système',
    'admin.nav.settings': 'Paramètres',
    'admin.nav.sales': 'Ventes',
    'admin.nav.quotes': 'Devis',
    'admin.nav.invoices': 'Factures',
    'admin.nav.delivery': 'Bons de livraison',
    'admin.nav.payments': 'Paiements',
    'admin.nav.products': 'Produits',
    'admin.nav.addProduct': 'Ajouter produit',
    'admin.nav.stock': 'Stock',
    'admin.nav.reports': 'Rapports',
    'admin.viewStore': 'Voir la boutique',
    'admin.logout': 'Se déconnecter',

    'product.notFoundTitle': 'Produit introuvable',
    'product.notFoundDesc': "Le laptop recherché n'existe pas ou a été supprimé.",
    'product.browseAll': 'Voir tous les laptops',
    'product.quantity': 'Quantité',
    'product.available': 'disponible',
    'product.adding': 'Ajout au panier...',
    'product.addToCart': 'Ajouter au panier',
    'product.whatsappOrder': 'Commander via WhatsApp',
    'product.whatsappOpening': 'Ouverture WhatsApp...',
    'product.techSpecs': 'Caractéristiques techniques',
    'product.backAll': 'Retour à tous les laptops',
    'product.perk.shipping': 'Livraison express offerte',
    'product.perk.returns': 'Retour facile sous 30 jours',
    'product.perk.warranty': 'Garantie 90 jours incluse',
    'toast.addedToCart': 'Ajouté au panier',
    'toast.whatsappOpened': 'WhatsApp ouvert',
    'toast.leadSynced': 'Lead enregistré et synchronisé vers Google.',
    'toast.leadSavedOnly': 'Lead enregistré. Configurez le webhook Google pour synchroniser.',
    'toast.whatsappSaveFail': 'WhatsApp ouvert, mais enregistrement CRM échoué',
    'toast.runMigration': 'Veuillez exécuter la dernière migration de base de données.',
  },
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function initialLocale(): Locale {
  if (typeof window === 'undefined') return 'fr'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'fr') return stored
  const browser = window.navigator.language.toLowerCase()
  return browser.startsWith('fr') ? 'fr' : 'en'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => initialLocale())

  useEffect(() => {
    document.documentElement.lang = locale
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const t = (key: string) => dictionaries[locale][key] ?? dictionaries.en[key] ?? key

  const value = useMemo(
    () => ({ locale, setLocale: setLocaleState, t }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
