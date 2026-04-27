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

function appliedVersions(): number[] {
  return (db.getAllSync(`SELECT version FROM migrations ORDER BY version`) as { version: number }[])
    .map((r) => r.version);
}

// ─── Schema ───────────────────────────────────────────────────────────────────

describe('runMigrations — schema', () => {
  it('cria exatamente as tabelas esperadas, sem extras', () => {
    runMigrations(db);
    expect(tables().sort()).toEqual(
      ['expenses', 'income', 'migrations', 'notes', 'streak', 'tasks'].sort()
    );
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

  it('tabela tasks possui as colunas corretas (incluindo v1)', () => {
    runMigrations(db);
    expect(columns('tasks')).toEqual(
      expect.arrayContaining([
        'id', 'title', 'status', 'date', 'created_at',
        'priority', 'recurrence', 'reminder_time', 'origin_task_id', 'notification_id',
      ])
    );
  });

  it('tabela notes possui as colunas corretas', () => {
    runMigrations(db);
    expect(columns('notes')).toEqual(
      expect.arrayContaining(['id', 'title', 'content', 'created_at', 'updated_at'])
    );
  });

  it('tabela streak possui as colunas corretas', () => {
    runMigrations(db);
    expect(columns('streak')).toEqual(
      expect.arrayContaining(['id', 'current_streak', 'best_streak', 'last_used_date'])
    );
  });

  it('tabela migrations possui version e applied_at', () => {
    runMigrations(db);
    expect(columns('migrations')).toEqual(
      expect.arrayContaining(['version', 'applied_at'])
    );
  });
});

// ─── Histórico de migrações ───────────────────────────────────────────────────

describe('runMigrations — histórico', () => {
  it('registra todas as versões aplicadas', () => {
    runMigrations(db);
    expect(appliedVersions()).toEqual([0, 1]);
  });

  it('registra applied_at como texto não-vazio para todas as versões aplicadas', () => {
    runMigrations(db);
    const rows = db.getAllSync<{ applied_at: string | null }>(`SELECT applied_at FROM migrations`);
    for (const row of rows) {
      // applied_at é sempre preenchido via INSERT explícito (não via DEFAULT),
      // pois ALTER TABLE no Android rejeita expressões não-constantes como datetime('now')
      expect(row.applied_at).not.toBeNull();
      expect(row.applied_at!.length).toBeGreaterThan(0);
    }
  });

  it('v1 seed: linha inicial de streak existe após migrar', () => {
    runMigrations(db);
    const row = db.getFirstSync<{ id: number }>(`SELECT id FROM streak WHERE id = 1`);
    expect(row?.id).toBe(1);
  });
});

// ─── Idempotência e segurança ─────────────────────────────────────────────────

describe('runMigrations — idempotência', () => {
  it('rodar duas vezes não gera erro nem duplica registros', () => {
    runMigrations(db);
    expect(() => runMigrations(db)).not.toThrow();
    expect(appliedVersions()).toEqual([0, 1]);
  });

  it('mantém dados existentes ao rodar novamente', () => {
    runMigrations(db);
    db.runSync(
      `INSERT INTO income (amount, category, payment_type, date) VALUES (?, ?, ?, ?)`,
      100, 'salary', 'pix', '2024-01-01'
    );
    runMigrations(db);
    expect(db.getAllSync(`SELECT * FROM income`)).toHaveLength(1);
  });

  it('simula upgrade: banco antigo sem migrations → aplica tudo corretamente', () => {
    // Banco legado: tabela tasks sem as novas colunas, sem migrations table
    db.execSync(`CREATE TABLE tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL
    )`);
    db.execSync(`INSERT INTO tasks (title, status, date) VALUES ('Tarefa antiga', 'pending', '2024-01-01')`);

    runMigrations(db);

    // Dado antigo preservado
    const tasks = db.getAllSync<{ title: string; priority: string }>(`SELECT title, priority FROM tasks`);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Tarefa antiga');
    expect(tasks[0].priority).toBe('normal'); // DEFAULT aplicado retroativamente

    // Colunas novas presentes
    expect(columns('tasks')).toEqual(
      expect.arrayContaining(['priority', 'recurrence', 'reminder_time'])
    );

    // Histórico correto
    expect(appliedVersions()).toEqual([0, 1]);
  });
});
