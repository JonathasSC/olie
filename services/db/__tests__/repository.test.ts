import { findAll, findById, insert, update, remove, query } from '../repository';
import { runMigrations } from '../migrations';
import { createTestDb } from './create-test-db';
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

describe('insert + findAll', () => {
  it('insere e lista registros em uma tabela', () => {
    insert('income', { amount: 500, category: 'salary', payment_type: 'pix', date: '2024-01-01' });
    insert('income', { amount: 200, category: 'freelance', payment_type: 'ted', date: '2024-01-02' });

    const rows = findAll('income');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ amount: 500, category: 'salary' });
    expect(rows[1]).toMatchObject({ amount: 200, category: 'freelance' });
  });

  it('retorna array vazio quando a tabela está vazia', () => {
    expect(findAll('income')).toHaveLength(0);
  });

  it('retorna o id do registro inserido', () => {
    const id = insert('income', { amount: 100, category: 'x', payment_type: 'pix', date: '2024-01-01' });
    expect(id).toBe(1);
    const id2 = insert('income', { amount: 200, category: 'y', payment_type: 'ted', date: '2024-01-02' });
    expect(id2).toBe(2);
  });
});

describe('findById', () => {
  it('retorna o registro pelo id', () => {
    const id = insert('income', { amount: 300, category: 'bonus', payment_type: 'pix', date: '2024-03-01' });
    const row = findById('income', id);
    expect(row).toMatchObject({ id, amount: 300, category: 'bonus' });
  });

  it('retorna null para id inexistente', () => {
    expect(findById('income', 9999)).toBeNull();
  });
});

describe('update', () => {
  it('atualiza apenas o registro correto', () => {
    const id1 = insert('income', { amount: 100, category: 'a', payment_type: 'pix', date: '2024-01-01' });
    const id2 = insert('income', { amount: 200, category: 'b', payment_type: 'ted', date: '2024-01-02' });

    update('income', id1, { amount: 999, category: 'updated' });

    expect(findById('income', id1)).toMatchObject({ amount: 999, category: 'updated' });
    expect(findById('income', id2)).toMatchObject({ amount: 200, category: 'b' });
  });
});

describe('remove', () => {
  it('remove o registro correto e mantém os demais', () => {
    const id1 = insert('income', { amount: 100, category: 'a', payment_type: 'pix', date: '2024-01-01' });
    const id2 = insert('income', { amount: 200, category: 'b', payment_type: 'ted', date: '2024-01-02' });

    remove('income', id1);

    expect(findById('income', id1)).toBeNull();
    expect(findById('income', id2)).not.toBeNull();
    expect(findAll('income')).toHaveLength(1);
  });
});

describe('query', () => {
  it('executa SQL customizado com parâmetros', () => {
    insert('income', { amount: 100, category: 'salary', payment_type: 'pix', date: '2024-01-01' });
    insert('income', { amount: 50, category: 'bonus', payment_type: 'pix', date: '2024-01-01' });
    insert('income', { amount: 200, category: 'salary', payment_type: 'ted', date: '2024-02-01' });

    const rows = query('SELECT * FROM income WHERE category = ?', 'salary');
    expect(rows).toHaveLength(2);
    expect(rows.every((r: any) => r.category === 'salary')).toBe(true);
  });
});
