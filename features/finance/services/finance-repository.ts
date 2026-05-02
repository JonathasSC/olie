import * as repository from '@/services/db/repository';
import { Income, Expense, ListItem } from '../types';

export const FinanceRepository = {
  listIncomes(): Income[] {
    return repository.findAll<Income>('income');
  },

  listExpenses(): Expense[] {
    return repository.findAll<Expense>('expenses');
  },

  findIncome(id: number): Income | null {
    return repository.findById<Income>('income', id);
  },

  findExpense(id: number): Expense | null {
    return repository.findById<Expense>('expenses', id);
  },

  addIncome(income: Omit<Income, 'id' | 'created_at'>): number {
    return repository.insert('income', income);
  },

  addExpense(expense: Omit<Expense, 'id' | 'created_at'>): number {
    return repository.insert('expenses', expense);
  },

  updateIncome(id: number, income: Omit<Income, 'id' | 'created_at'>): void {
    repository.update('income', id, income);
  },

  updateExpense(id: number, expense: Omit<Expense, 'id' | 'created_at'>): void {
    repository.update('expenses', id, expense);
  },

  deleteIncome(id: number): void {
    repository.remove('income', id);
  },

  deleteExpense(id: number): void {
    repository.remove('expenses', id);
  },

  listAll(): ListItem[] {
    const incomes = repository.query<Income>(
      'SELECT * FROM income ORDER BY created_at DESC'
    ).map(i => ({ ...i, type: 'income' as const }));

    const expenses = repository.query<Expense>(
      'SELECT * FROM expenses ORDER BY created_at DESC'
    ).map(e => ({ ...e, type: 'expense' as const }));

    return [...incomes, ...expenses].sort((a, b) =>
      (b.created_at ?? '').localeCompare(a.created_at ?? '')
    );
  }
};
