import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let db: SQLite.SQLiteDatabase | null = null;

function initializeDatabase() {
  if (!db) {
    db = SQLite.openDatabaseSync('olie.db');
    runMigrations(db);
  }
  return db;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  return initializeDatabase();
}

export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
}
