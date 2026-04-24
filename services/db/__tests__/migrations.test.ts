import { runMigrations } from '../migrations';
import { createTestDb } from './create-test-db';
import type { SQLiteDatabase } from 'expo-sqlite';

let db: SQLiteDatabase;

beforeEach(() => {
  db = createTestDb();
});

afterEach(() => {
  db.closeSync();
});

function tables(): string[] {
  return (db.getAllSync(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
  ) as { name: string }[]).map((r) => r.name);
}

function columns(table: string): string[] {
  return (db.getAllSync(`PRAGMA table_info(${table})`) as { name: string }[]).map((c) => c.name);
}

describe('runMigrations', () => {
  it('cria todas as tabelas obrigatórias', () => {
    runMigrations(db);
    expect(tables()).toEqual(
      expect.arrayContaining(['income', 'expenses', 'tasks', 'notes', 'migrations'])
    );
  });

  it('cria exatamente as tabelas esperadas, sem extras', () => {
    runMigrations(db);
    expect(tables().sort()).toEqual(
      ['expenses', 'income', 'migrations', 'notes', 'tasks'].sort()
    );
  });

  it('é idempotente — rodar duas vezes não gera erro', () => {
    runMigrations(db);
    expect(() => runMigrations(db)).not.toThrow();
  });

  it('mantém as linhas existentes ao rodar novamente', () => {
    runMigrations(db);
    db.runSync(
      `INSERT INTO income (amount, category, payment_type, date) VALUES (?, ?, ?, ?)`,
      100, 'salary', 'pix', '2024-01-01'
    );
    runMigrations(db);
    expect(db.getAllSync(`SELECT * FROM income`)).toHaveLength(1);
  });

  it('tabela income possui as colunas corretas', () => {
    runMigrations(db);
    expect(columns('income')).toEqual(
      expect.arrayContaining(['id', 'amount', 'category', 'payment_type', 'date', 'created_at'])
    );
  });

  it('tabela expenses possui as colunas corretas', () => {
    runMigrations(db);
    expect(columns('expenses')).toEqual(
      expect.arrayContaining([
        'id', 'amount', 'category', 'payment_type',
        'installments', 'purchase_date', 'payment_date', 'created_at',
      ])
    );
  });

  it('tabela tasks possui as colunas corretas', () => {
    runMigrations(db);
    expect(columns('tasks')).toEqual(
      expect.arrayContaining(['id', 'title', 'status', 'date', 'created_at'])
    );
  });

  it('tabela notes possui as colunas corretas', () => {
    runMigrations(db);
    expect(columns('notes')).toEqual(
      expect.arrayContaining(['id', 'title', 'content', 'created_at', 'updated_at'])
    );
  });
});
