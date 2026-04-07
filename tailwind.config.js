/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        /* ── shadcn-ui base tokens ── */
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* ── Semantic surface tokens (use these instead of #hex) ──
           Light:  base=white-ish  sunken=light-grey  raised=white   overlay=white
           Dark:   base=#070c15   sunken=#080d16     raised=#0f1726 overlay=#131e33
        ── */
        surface: {
          base:    'hsl(var(--surface-base))',    /* page-level background  */
          sunken:  'hsl(var(--surface-sunken))',  /* info bars, top bars    */
          raised:  'hsl(var(--surface-raised))',  /* cards, panels          */
          overlay: 'hsl(var(--surface-overlay))', /* drawers, modals        */
        },

        /* ── On-surface text tokens (use these instead of text-white/XX) ── */
        'on-surface': {
          DEFAULT: 'hsl(var(--on-surface))',          /* primary text   */
          muted:   'hsl(var(--on-surface-muted))',    /* secondary text */
          subtle:  'hsl(var(--on-surface-subtle))',   /* tertiary text  */
          faint:   'hsl(var(--on-surface-faint))',    /* placeholders   */
        },

        /* ── Border tokens (use these instead of border-white/XX) ── */
        'border-subtle': 'hsl(var(--border-subtle))',
        'border-faint':  'hsl(var(--border-faint))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'Segoe UI', 'sans-serif'],
        display: ['Sora', 'Manrope', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
