import * as repository from '@/services/db/repository';
import { Income, Expense, ListItem } from '../types';

export const FinanceRepository = {
  listIncomes(): Income[] {
    return repository.findAll<Income>('income');
  },

  listExpenses(): Expense[] {
    return repository.findAll<Expense>('expenses');
  },

  addIncome(income: Omit<Income, 'id' | 'created_at'>): number {
    return repository.insert('income', income);
  },

  addExpense(expense: Omit<Expense, 'id' | 'created_at'>): number {
    return repository.insert('expenses', expense);
  },

  deleteIncome(id: number): void {
    repository.remove('income', id);
  },

  deleteExpense(id: number): void {
    repository.remove('expenses', id);
  },

  listAll(): ListItem[] {
    const incomes = this.listIncomes().map(i => ({ ...i, type: 'income' as const }));
    const expenses = this.listExpenses().map(e => ({ ...e, type: 'expense' as const }));

    return [...incomes, ...expenses].sort((a, b) => 
      (b.created_at ?? '').localeCompare(a.created_at ?? '')
    );
  }
};
