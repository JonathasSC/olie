import BetterSQLite from 'better-sqlite3';
import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Creates an in-memory SQLite database using better-sqlite3 that mirrors
 * the synchronous expo-sqlite API used throughout the app.
 */
export function createTestDb(): SQLiteDatabase {
  const db = new BetterSQLite(':memory:');

  return {
    execSync(sql: string) {
      db.exec(sql);
    },
    getAllSync<T>(sql: string, ...params: unknown[]): T[] {
      return db.prepare(sql).all(...(params as any[])) as T[];
    },
    getFirstSync<T>(sql: string, ...params: unknown[]): T | null {
      return (db.prepare(sql).get(...(params as any[])) as T) ?? null;
    },
    runSync(sql: string, ...params: unknown[]) {
      const result = db.prepare(sql).run(...(params as any[]));
      return {
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: result.changes,
      };
    },
    withTransactionSync(task: () => void) {
      db.transaction(task)();
    },
    closeSync() {
      db.close();
    },
  } as unknown as SQLiteDatabase;
}
