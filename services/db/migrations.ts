import { getDatabase } from './database';

const MIGRATIONS: { version: number; up: string[] }[] = [
  {
    version: 1,
    up: [
      `CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY
      )`,
    ],
  },
];

export function runMigrations(): void {
  const db = getDatabase();

  db.execSync(`CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY)`);

  const applied = db
    .getAllSync<{ version: number }>('SELECT version FROM migrations')
    .map((r) => r.version);

  for (const migration of MIGRATIONS) {
    if (applied.includes(migration.version)) continue;

    db.withTransactionSync(() => {
      for (const sql of migration.up) {
        db.execSync(sql);
      }
      db.runSync('INSERT INTO migrations (version) VALUES (?)', migration.version);
    });
  }
}
