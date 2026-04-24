import { FinanceRepository } from '../finance-repository';
import { runMigrations } from '@/services/db/migrations';
import { createTestDb } from '@/services/db/__tests__/create-test-db';
import type { SQLiteDatabase } from 'expo-sqlite';

jest.mock('@/services/db/database', () => ({ getDatabase: jest.fn() }));

import { getDatabase } from '@/services/db/database';

let db: SQLiteDatabase;

beforeEach(() => {
  db = createTestDb();
  runMigrations(db);
  (getDatabase as jest.Mock).mockReturnValue(db);
});

afterEach(() => {
  (db as any).closeSync();
});

const sampleIncome = {
  amount: 3000,
  category: 'salary',
  payment_type: 'pix',
  date: '2024-01-05',
};

const sampleExpense = {
  amount: 150,
  category: 'food',
  payment_type: 'credit',
  installments: 1,
  purchase_date: '2024-01-10',
  payment_date: '2024-02-10',
};

describe('FinanceRepository — income', () => {
  it('listIncomes retorna array vazio inicialmente', () => {
    expect(FinanceRepository.listIncomes()).toHaveLength(0);
  });

  it('addIncome insere e retorna id', () => {
    const id = FinanceRepository.addIncome(sampleIncome);
    expect(id).toBeGreaterThan(0);
  });

  it('listIncomes retorna os incomes inseridos', () => {
    FinanceRepository.addIncome(sampleIncome);
    FinanceRepository.addIncome({ ...sampleIncome, amount: 500, category: 'freelance' });

    const list = FinanceRepository.listIncomes();
    expect(list).toHaveLength(2);
    expect(list.map((i) => i.category)).toEqual(
      expect.arrayContaining(['salary', 'freelance'])
    );
  });

  it('deleteIncome remove o registro', () => {
    const id = FinanceRepository.addIncome(sampleIncome);
    FinanceRepository.deleteIncome(id);
    expect(FinanceRepository.listIncomes()).toHaveLength(0);
  });

  it('deleteIncome remove apenas o registro alvo', () => {
    const id1 = FinanceRepository.addIncome(sampleIncome);
    FinanceRepository.addIncome({ ...sampleIncome, amount: 999 });
    FinanceRepository.deleteIncome(id1);
    expect(FinanceRepository.listIncomes()).toHaveLength(1);
  });
});

describe('FinanceRepository — expenses', () => {
  it('listExpenses retorna array vazio inicialmente', () => {
    expect(FinanceRepository.listExpenses()).toHaveLength(0);
  });

  it('addExpense insere e retorna id', () => {
    const id = FinanceRepository.addExpense(sampleExpense);
    expect(id).toBeGreaterThan(0);
  });

  it('listExpenses retorna os expenses inseridos', () => {
    FinanceRepository.addExpense(sampleExpense);
    FinanceRepository.addExpense({ ...sampleExpense, amount: 80, category: 'transport' });

    const list = FinanceRepository.listExpenses();
    expect(list).toHaveLength(2);
    expect(list.map((e) => e.category)).toEqual(
      expect.arrayContaining(['food', 'transport'])
    );
  });

  it('deleteExpense remove o registro', () => {
    const id = FinanceRepository.addExpense(sampleExpense);
    FinanceRepository.deleteExpense(id);
    expect(FinanceRepository.listExpenses()).toHaveLength(0);
  });
});

describe('FinanceRepository — listAll', () => {
  it('combina incomes e expenses', () => {
    FinanceRepository.addIncome(sampleIncome);
    FinanceRepository.addExpense(sampleExpense);

    const all = FinanceRepository.listAll();
    expect(all).toHaveLength(2);
    expect(all.map((i) => i.type)).toEqual(expect.arrayContaining(['income', 'expense']));
  });

  it('retorna array vazio quando não há registros', () => {
    expect(FinanceRepository.listAll()).toHaveLength(0);
  });

  it('inclui campo type correto em cada item', () => {
    FinanceRepository.addIncome(sampleIncome);
    FinanceRepository.addExpense(sampleExpense);

    const all = FinanceRepository.listAll();
    const incomes = all.filter((i) => i.type === 'income');
    const expenses = all.filter((i) => i.type === 'expense');
    expect(incomes).toHaveLength(1);
    expect(expenses).toHaveLength(1);
  });
});
