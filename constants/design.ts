/**
 * Olie Design System — fonte única de verdade.
 * Baseado no Design System Proposal (abril 2026).
 */

// ── Paleta de cores ──────────────────────────────────────────────────────────
export const Colors = {
  // Brand — Indigo Violet
  brand:     '#7C6FFF',
  brandDim:  'rgba(124,111,255,0.14)',
  brandLt:   '#A99AFF',

  // Superfícies — Deep Navy
  bg:       '#06071C',
  bgCard:   '#0C0E28',
  bgSurf:   '#141732',
  bgRaised: '#1C1F3C',

  // Bordas
  bdr:  '#1C1F3C',
  bdr2: '#252850',

  // Texto
  t1: '#ECEEFF',
  t2: '#8C8BB2',
  t3: '#464870',

  // Semânticas
  income:  '#4ECBA3',
  expense: '#F07B6B',
  task:    '#9B8AFF',
  note:    '#F5B94E',
  danger:  '#F06B6B',

  // Superfícies semânticas (alpha)
  incomeSurf:  'rgba(78,203,163,0.12)',
  expenseSurf: 'rgba(240,123,107,0.12)',
  taskSurf:    'rgba(155,138,255,0.10)',
  noteSurf:    'rgba(245,185,78,0.10)',

  // Overlay
  overlay: 'rgba(3,5,18,0.78)',
} as const;

// ── Border Radius ─────────────────────────────────────────────────────────────
export const Radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

// ── Tipografia ────────────────────────────────────────────────────────────────
export const Fonts = {
  display: 'PlusJakartaSans_800ExtraBold',
  heading: 'PlusJakartaSans_700Bold',
  body:    'DMSans_400Regular',
  bodyMd:  'DMSans_500Medium',
  bodySb:  'DMSans_600SemiBold',
  bodyBd:  'DMSans_700Bold',
  mono:    'DMMono_500Medium',
  monoReg: 'DMMono_400Regular',
} as const;


export const Shadow = {
  brand: {
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

// ── Tab bar ───────────────────────────────────────────────────────────────────
export const TAB_HEIGHT = 68;
