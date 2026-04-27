import type { SQLiteDatabase } from 'expo-sqlite';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Migration {
  version: number;
  description: string;
  up: (db: SQLiteDatabase) => void;
  // Optional: return true when the migration's changes are confirmed present.
  // The runner calls this for already-recorded migrations and re-runs any that
  // return false (handles the case where a version was recorded but the work
  // was lost — e.g. a partially-applied migration from a previous broken build).
  verify?: (db: SQLiteDatabase) => boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tableColumns(db: SQLiteDatabase, table: string): Set<string> {
  return new Set(
    db.getAllSync<{ name: string }>(`PRAGMA table_info(${table})`).map((r) => r.name)
  );
}

// Adds a column only if it does not already exist.
// Does NOT use NOT NULL in the definition — Android SQLite may reject it in ALTER TABLE.
function addColumn(db: SQLiteDatabase, table: string, column: string, definition: string): void {
  if (!tableColumns(db, table).has(column)) {
    db.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

// ─── Migrations ───────────────────────────────────────────────────────────────
// Rules:
//   • Append new migrations at the END of this array.
//   • Never edit a migration that has already shipped — add a new version instead.
//   • Each migration is atomic: if up() throws, the transaction rolls back and
//     the version is NOT recorded, so the next launch will retry cleanly.
//   • Add verify() to any migration that touches schema so the runner can
//     self-heal if the version was recorded without the work actually landing.

const ALL_MIGRATIONS: Migration[] = [

  {
    version: 0,
    description: 'bootstrap: create all base tables',
    up(db) {
      db.execSync(`CREATE TABLE IF NOT EXISTS income (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        amount       REAL    NOT NULL,
        category     TEXT    NOT NULL,
        payment_type TEXT    NOT NULL,
        date         TEXT    NOT NULL,
        created_at   TEXT    DEFAULT (datetime('now'))
      )`);
      db.execSync(`CREATE TABLE IF NOT EXISTS expenses (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        amount        REAL    NOT NULL,
        category      TEXT    NOT NULL,
        payment_type  TEXT    NOT NULL,
        installments  INTEGER NOT NULL DEFAULT 1,
        purchase_date TEXT    NOT NULL,
        payment_date  TEXT    NOT NULL,
        created_at    TEXT    DEFAULT (datetime('now'))
      )`);
      db.execSync(`CREATE TABLE IF NOT EXISTS tasks (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        title      TEXT    NOT NULL,
        status     TEXT    NOT NULL,
        date       TEXT    NOT NULL,
        created_at TEXT    DEFAULT (datetime('now'))
      )`);
      db.execSync(`CREATE TABLE IF NOT EXISTS notes (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        title      TEXT    NOT NULL,
        content    TEXT    NOT NULL,
        created_at TEXT    DEFAULT (datetime('now')),
        updated_at TEXT    DEFAULT (datetime('now'))
      )`);
      db.execSync(`CREATE TABLE IF NOT EXISTS streak (
        id             INTEGER PRIMARY KEY,
        current_streak INTEGER NOT NULL DEFAULT 0,
        best_streak    INTEGER NOT NULL DEFAULT 0,
        last_used_date TEXT
      )`);
    },
    verify(db) {
      const cols = tableColumns(db, 'tasks');
      return cols.has('id') && cols.has('title') && cols.has('status');
    },
  },

  {
    version: 1,
    description: 'tasks: priority, recurrence, reminder_time, origin_task_id, notification_id; seed streak row',
    up(db) {
      // No NOT NULL here — Android SQLite may reject NOT NULL in ALTER TABLE
      addColumn(db, 'tasks', 'priority',        `TEXT DEFAULT 'normal'`);
      addColumn(db, 'tasks', 'recurrence',      `TEXT DEFAULT 'none'`);
      addColumn(db, 'tasks', 'reminder_time',   `TEXT`);
      addColumn(db, 'tasks', 'origin_task_id',  `INTEGER`);
      addColumn(db, 'tasks', 'notification_id', `TEXT`);
      db.execSync(`INSERT OR IGNORE INTO streak (id, current_streak, best_streak) VALUES (1, 0, 0)`);
    },
    verify(db) {
      const cols = tableColumns(db, 'tasks');
      return ['priority', 'recurrence', 'reminder_time', 'origin_task_id', 'notification_id']
        .every((c) => cols.has(c));
    },
  },

];

// ─── Runner ───────────────────────────────────────────────────────────────────

export function runMigrations(db: SQLiteDatabase): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS migrations (
      version    INTEGER PRIMARY KEY,
      applied_at TEXT
    )
  `);
  // Bring the applied_at column to databases created before it was added.
  // Cannot use datetime('now') as ALTER TABLE default — Android SQLite rejects
  // non-constant expressions; the value is provided explicitly on INSERT instead.
  addColumn(db, 'migrations', 'applied_at', `TEXT`);

  const applied = new Set(
    db.getAllSync<{ version: number }>('SELECT version FROM migrations').map((r) => r.version)
  );

  // Self-heal: if a version was recorded but its changes are not actually present
  // (can happen when a previous build had a bug in the migration runner), reset it
  // so it will be re-applied below.
  for (const migration of ALL_MIGRATIONS) {
    if (applied.has(migration.version) && migration.verify && !migration.verify(db)) {
      db.runSync('DELETE FROM migrations WHERE version = ?', migration.version);
      applied.delete(migration.version);
    }
  }

  const pending = ALL_MIGRATIONS
    .filter((m) => !applied.has(m.version))
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    db.withTransactionSync(() => {
      migration.up(db);
      db.runSync(
        `INSERT INTO migrations (version, applied_at) VALUES (?, datetime('now'))`,
        migration.version
      );
    });
  }
}
