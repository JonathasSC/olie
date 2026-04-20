import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('olie.db');
  }
  return db;
}

export function closeDatabase(): void {
  db?.closeSync();
  db = null;
}
