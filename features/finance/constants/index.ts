export const FIN_COLORS = {
  bg:           '#0A0A0A',
  surface:      '#161616',
  surfaceHigh:  '#1E1E1E',
  surfaceInput: '#121212',
  border:        '#2C2C2C',
  borderLight:   '#222222',
  textPrimary:   '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted:     '#525252',
  accent:        '#820AD1',
  accentDark:    '#6A08AB',
  accentSurface: '#1D0A2E',
  income:        '#34D399',
  incomeSurface: 'rgba(52, 211, 153, 0.12)',
  expense:       '#F87171',
  expenseSurface:'rgba(248, 113, 113, 0.12)',
  warning:        '#FBBF24',
  warningSurface: 'rgba(251, 191, 36, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.75)',
} as const;

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Bonus', 'Gift'];
export const INCOME_PAYMENT_TYPES = ['Cash', 'Digital (Pix)', 'Ticket'];
export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Bills', 'Leisure'];
export const EXPENSE_PAYMENT_TYPES = ['Credit', 'Balance', 'Ticket'];

export type CategoryIcon = 'fork.knife' | 'car.fill' | 'doc.text.fill' | 'sparkles' | 'briefcase.fill' | 'laptopcomputer' | 'gift.fill' | 'dollarsign.circle.fill';

export const CATEGORY_ICON: Record<string, CategoryIcon> = {
  Food: 'fork.knife',
  Transport: 'car.fill',
  Bills: 'doc.text.fill',
  Leisure: 'sparkles',
  Salary: 'briefcase.fill',
  Freelance: 'laptopcomputer',
  Bonus: 'gift.fill',
  Gift: 'gift.fill',
};
