export type FinanceType = 'income' | 'expense';

export interface Income {
  id?: number;
  amount: number;
  category: string;
  payment_type: string;
  date: string;
  created_at?: string;
}

export interface Expense {
  id?: number;
  amount: number;
  category: string;
  payment_type: string;
  installments: number;
  purchase_date: string;
  payment_date: string;
  created_at?: string;
}

export type ListItem = (Income | Expense) & { type: FinanceType };

export type Period = 'today' | 'week' | 'month';

export type FinanceGroup = {
  label: string;
  sortKey: string;
  items: ListItem[];
};

export type FinanceSummary = {
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
};
