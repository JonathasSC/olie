import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let db: SQLite.SQLiteDatabase = SQLite.openDatabaseSync('olie.db');
runMigrations(db);

export function getDatabase(): SQLite.SQLiteDatabase {
  return db;
}

export function closeDatabase(): void {
  db.closeSync();
}
