import { Colors } from '@/constants/design';

export const FINANCE_COLORS = {
  bg:           Colors.bg,
  surface:      Colors.bgCard,
  surfaceHigh:  Colors.bgCard,
  surfaceInput: Colors.bgSurf,
  border:       Colors.bdr,
  borderLight:  Colors.bdr,
  textPrimary:   Colors.t1,
  textSecondary: Colors.t2,
  textMuted:     Colors.t3,
  accent:        Colors.brand,
  accentDark:    Colors.brand,
  accentSurface: Colors.brandDim,
  income:        Colors.income,
  incomeSurface: Colors.incomeSurf,
  expense:       Colors.expense,
  expenseSurface: Colors.expenseSurf,
  warning:       Colors.note,
  warningSurface: Colors.noteSurf,
  overlay:       Colors.overlay,
} as const;

export const INCOME_CATEGORIES = ['Salário', 'Freelance', 'Bônus', 'Presente'];
export const INCOME_TYPES      = ['Conta', 'PIX', 'Cheque'];
export const EXPENSE_CATEGORIES = ['Alimentação', 'Transporte', 'Contas', 'Compras', 'Saúde', 'Lazer', 'Assinat.', 'Outros'];
export const EXPENSE_TYPES      = ['Crédito', 'Débito', 'PIX', 'Dinheiro'];

// Backwards compat aliases
export const INCOME_PAYMENT_TYPES  = INCOME_TYPES;
export const EXPENSE_PAYMENT_TYPES = EXPENSE_TYPES;

export type CategoryIcon =
  | 'fork.knife'
  | 'car.fill'
  | 'doc.text.fill'
  | 'sparkles'
  | 'briefcase.fill'
  | 'laptopcomputer'
  | 'gift.fill'
  | 'dollarsign.circle.fill'
  | 'heart.fill'
  | 'cart.fill'
  | 'antenna.radiowaves.left.and.right'
  | 'ellipsis.circle.fill';

export const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  'Alimentação': 'fork.knife',
  'Transporte':  'car.fill',
  'Contas':      'doc.text.fill',
  'Compras':     'cart.fill',
  'Saúde':       'heart.fill',
  'Lazer':       'sparkles',
  'Assinat.':    'antenna.radiowaves.left.and.right',
  'Outros':      'ellipsis.circle.fill',
  'Salário':     'briefcase.fill',
  'Freelance':   'laptopcomputer',
  'Bônus':       'dollarsign.circle.fill',
  'Presente':    'gift.fill',
};

// backwards compat
export const CATEGORY_ICON = CATEGORY_ICONS;
