import { Colors } from '@/constants/design';
import { EXPENSE_CATEGORIES, EXPENSE_TYPES, INCOME_CATEGORIES, INCOME_TYPES } from './index';

export const INVESTMENT_CATEGORIES = ['Ações', 'Fundo', 'Cripto', 'CDB', 'Tesouro', 'Outros'] as const;
export const INVESTMENT_TYPES      = ['PIX', 'TED', 'Débito'] as const;

export type FormType = 'expense' | 'income' | 'investment';

export interface FormConfig {
  title: string;
  accent: string;
  categories: string[];
  paymentTypes: string[];
  paymentLabel: string;
  hasInstallments: boolean;
  hasExpenseDates: boolean;
}

export const FINANCE_FORM_CONFIG: Record<FormType, FormConfig> = {
  expense: {
    title: 'Novo Gasto',
    accent: Colors.expense,
    categories: EXPENSE_CATEGORIES,
    paymentTypes: EXPENSE_TYPES,
    paymentLabel: 'Forma de pagamento',
    hasInstallments: true,
    hasExpenseDates: true,
  },
  income: {
    title: 'Novo Ganho',
    accent: Colors.income,
    categories: INCOME_CATEGORIES,
    paymentTypes: INCOME_TYPES,
    paymentLabel: 'Forma de recebimento',
    hasInstallments: false,
    hasExpenseDates: false,
  },
  investment: {
    title: 'Novo Investimento',
    accent: Colors.brand,
    categories: INVESTMENT_CATEGORIES,
    paymentTypes: INVESTMENT_TYPES,
    paymentLabel: 'Forma de aporte',
    hasInstallments: false,
    hasExpenseDates: false,
  },
};

export const INSTALLMENT_OPTIONS: { value: string; label: string }[] = [
  { value: '1',  label: 'À vista' },
  { value: '2',  label: '2x' },
  { value: '3',  label: '3x' },
  { value: '6',  label: '6x' },
  { value: '12', label: '12x' },
];
