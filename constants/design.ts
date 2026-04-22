/**
 * Design system — single source of truth for colors, spacing, typography and shadows.
 * Import `T` in any screen to keep styles consistent across the app.
 */
export const T = {
  // ── Palette ──────────────────────────────────────────────────────────────
  brand:        '#0A7EA4',
  brandDark:    '#0369A1',
  brandSurface: '#E0F2FE',

  income:        '#059669', // emerald-600
  incomeSurface: '#ECFDF5',

  expense:        '#DC2626', // red-600
  expenseSurface: '#FEF2F2',

  warning:        '#D97706', // amber-600
  warningSurface: '#FFFBEB',

  task:        '#0A7EA4', // same as brand for consistency
  taskSurface: '#E0F2FE',

  // ── Backgrounds ──────────────────────────────────────────────────────────
  bg:         '#F1F5F9', // app background (slate-100)
  surface:    '#FFFFFF', // card / sheet surface
  surfaceAlt: '#F8FAFC', // input / secondary surface

  // ── Borders ──────────────────────────────────────────────────────────────
  border:      '#E2E8F0', // slate-200
  borderLight: '#EEF2F7',

  // ── Text ─────────────────────────────────────────────────────────────────
  textPrimary:   '#0F172A', // slate-900
  textSecondary: '#475569', // slate-600
  textMuted:     '#94A3B8', // slate-400

  // ── Status (tasks) ───────────────────────────────────────────────────────
  statusPending: '#94A3B8',
  statusDoing:   '#D97706',
  statusDone:    '#059669',

  // ── Overlay ──────────────────────────────────────────────────────────────
  overlay: 'rgba(15, 23, 42, 0.5)',
} as const;

/** Card shadow — use spread syntax: `{ ...shadow }` */
export const shadow = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.07,
  shadowRadius: 4,
  elevation: 2,
} as const;

/** Stronger shadow for buttons / floating elements */
export const shadowMd = {
  shadowColor: '#0F172A',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.14,
  shadowRadius: 10,
  elevation: 5,
} as const;
