import type { SQLiteDatabase } from 'expo-sqlite';

const BOOTSTRAP_TABLES = [
  `CREATE TABLE IF NOT EXISTS income (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    amount       REAL    NOT NULL,
    category     TEXT    NOT NULL,
    payment_type TEXT    NOT NULL,
    date         TEXT    NOT NULL,
    created_at   TEXT    DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    amount        REAL    NOT NULL,
    category      TEXT    NOT NULL,
    payment_type  TEXT    NOT NULL,
    installments  INTEGER NOT NULL DEFAULT 1,
    purchase_date TEXT    NOT NULL,
    payment_date  TEXT    NOT NULL,
    created_at    TEXT    DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS tasks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    status     TEXT    NOT NULL,
    date       TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    content    TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now')),
    updated_at TEXT    DEFAULT (datetime('now'))
  )`,
];

// Add ALTER TABLE or data migrations here for future schema changes
const MIGRATION_DEFS: { version: number; up: string[] }[] = [];

export function runMigrations(db: SQLiteDatabase): void {
  db.withTransactionSync(() => {
    for (const sql of BOOTSTRAP_TABLES) {
      db.execSync(sql);
    }
  });

  db.execSync(`CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY)`);

  const applied = db
    .getAllSync<{ version: number }>('SELECT version FROM migrations')
    .map((r) => r.version);

  for (const migration of MIGRATION_DEFS) {
    if (applied.includes(migration.version)) continue;

    db.withTransactionSync(() => {
      for (const sql of migration.up) {
        db.execSync(sql);
      }
      db.runSync('INSERT INTO migrations (version) VALUES (?)', migration.version);
    });
  }
}
