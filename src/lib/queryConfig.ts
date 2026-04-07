/* ============================================================
   REACT QUERY CONFIG
   Centralised stale-time constants so every hook uses the
   same cache policy. Change once, affects everywhere.
   ============================================================ */

export const STALE = {
  /** 2 min — product lists (filters can change often) */
  SHORT:  1000 * 60 * 2,
  /** 5 min — single product, featured lists */
  NORMAL: 1000 * 60 * 5,
  /** 30 min — near-static reference data (brands, specs) */
  LONG:   1000 * 60 * 30,
} as const
