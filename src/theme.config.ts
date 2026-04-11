/**
 * ================================================================
 *  THEME CONFIG — Single source of truth for all design tokens
 *
 *  HOW IT WORKS:
 *   1. CSS variables are defined in src/index.css (:root / .dark)
 *   2. Tailwind reads them via tailwind.config.ts (hsl(var(--...)))
 *   3. This file documents every token so you know what to change
 *
 *  TO CHANGE A COLOR:
 *   → Edit the CSS variable value in src/index.css
 *   → Both light + dark mode are defined there
 *   → No need to touch tailwind.config.ts unless adding new tokens
 * ================================================================
 */

// ── CSS Variable Reference ────────────────────────────────────────
// Format: HSL without the hsl() wrapper  →  "H S% L%"

export const CSS_VARS = {

  // ── Light mode (:root in index.css) ──────────────────────────

  light: {
    // Page & surface backgrounds
    'surface-base':    '210 20% 98%',   // bg-surface-base    → near-white page bg
    'surface-sunken':  '210 16% 94%',   // bg-surface-sunken  → slightly recessed
    'surface-raised':  '0 0% 100%',     // bg-surface-raised  → cards, panels
    'surface-overlay': '0 0% 100%',     // bg-surface-overlay → modals, drawers

    // Text
    'on-surface':        '222 47% 11%', // text-on-surface        → primary text
    'on-surface-muted':  '215 16% 40%', // text-on-surface-muted  → secondary
    'on-surface-subtle': '215 16% 60%', // text-on-surface-subtle → tertiary
    'on-surface-faint':  '215 16% 72%', // text-on-surface-faint  → placeholder

    // Borders
    'border-subtle': '214 20% 90%',     // border-border-subtle
    'border-faint':  '214 20% 93%',     // border-border-faint

    // Brand
    primary:   '36 92% 50%',            // amber — buttons, accents
    highlight: '36 92% 50%',            // glow borders

    // shadcn-ui base tokens
    background:  '210 20% 98%',
    foreground:  '222 47% 11%',
    border:      '214 20% 86%',
    ring:        '36 92% 50%',
    muted:       '210 16% 93%',
    'muted-foreground': '215 16% 47%',
    destructive: '354 78% 55%',

    // Decorative orbs (theme-shell class)
    'shell-glow-a': '205 100% 67%',     // blue orb
    'shell-glow-b': '36 90% 55%',       // amber orb
  },

  // ── Dark mode (.dark in index.css) ───────────────────────────

  dark: {
    // Page & surface backgrounds
    'surface-base':    '220 32% 6%',    // bg-surface-base    → #070c15
    'surface-sunken':  '220 30% 7%',    // bg-surface-sunken  → #080d16
    'surface-raised':  '220 28% 10%',   // bg-surface-raised  → #0f1726
    'surface-overlay': '220 28% 12%',   // bg-surface-overlay → drawers/modals

    // Text
    'on-surface':        '210 36% 96%', // text-on-surface        → near-white
    'on-surface-muted':  '210 20% 75%', // text-on-surface-muted
    'on-surface-subtle': '210 16% 55%', // text-on-surface-subtle
    'on-surface-faint':  '210 14% 38%', // text-on-surface-faint

    // Borders
    'border-subtle': '220 18% 22%',     // border-border-subtle
    'border-faint':  '220 18% 16%',     // border-border-faint

    // Brand
    primary:   '36 92% 55%',            // amber — slightly lighter in dark
    highlight: '36 92% 55%',

    // shadcn-ui base tokens
    background:  '220 32% 8%',
    foreground:  '210 36% 96%',
    border:      '220 18% 22%',
    ring:        '36 92% 55%',
    muted:       '220 18% 18%',
    'muted-foreground': '215 16% 62%',
    destructive: '354 78% 55%',

    // Decorative orbs
    'shell-glow-a': '199 89% 48%',
    'shell-glow-b': '36 90% 55%',
  },

} as const


// ── Tailwind Class Reference ──────────────────────────────────────
// Quick lookup — what class to use for each design intent

export const TAILWIND_TOKENS = {

  // Backgrounds
  bg: {
    page:        'bg-surface-base',       // main page background
    recessed:    'bg-surface-sunken',     // info bars, alternating sections
    card:        'bg-surface-raised',     // cards, panels
    modal:       'bg-surface-overlay',    // modals, drawers
    skySection:  'bg-sky-50 dark:bg-sky-950/20', // blue-tinted sections
  },

  // Text
  text: {
    primary:  'text-on-surface',          // headings, body
    secondary: 'text-on-surface-muted',   // labels, secondary info
    tertiary:  'text-on-surface-subtle',  // helper text
    faint:     'text-on-surface-faint',   // placeholders, hints
    brand:     'text-amber-500',          // amber accent
    brandDark: 'text-amber-400',          // amber in dark sections
  },

  // Borders
  border: {
    default: 'border-border',
    subtle:  'border-border-subtle',
    faint:   'border-border-faint',
  },

  // Typography
  font: {
    sans:    'font-sans',     // Manrope — body text
    display: 'font-display',  // Sora    — headings
  },

} as const


// ── Section Background Pattern ────────────────────────────────────
// The landing page alternates between these to visually separate sections

export const SECTION_BG_PATTERN = [
  'bg-surface-base',                       // default / neutral
  'bg-surface-sunken',                     // slightly grey
  'bg-sky-50 dark:bg-sky-950/20',          // sky blue accent
] as const
