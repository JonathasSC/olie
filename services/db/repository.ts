import type { SQLiteBindValue } from 'expo-sqlite';
import { getDatabase } from './database';

type Row = Record<string, any>;

export function findAll<T extends Row>(table: string): T[] {
  try {
    return getDatabase().getAllSync<T>(`SELECT * FROM ${table}`);
  } catch (e) {
    console.error(`[DB] findAll("${table}") failed:`, e);
    return [];
  }
}

export function findById<T extends Row>(table: string, id: number): T | null {
  try {
    return getDatabase().getFirstSync<T>(`SELECT * FROM ${table} WHERE id = ?`, id) ?? null;
  } catch (e) {
    console.error(`[DB] findById("${table}", ${id}) failed:`, e);
    return null;
  }
}

export function insert(table: string, data: Row): number {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const values = Object.values(data) as SQLiteBindValue[];
  try {
    const result = getDatabase().runSync(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
      ...values
    );
    return result.lastInsertRowId;
  } catch (e) {
    console.error(`[DB] insert("${table}") failed:`, e);
    throw e;
  }
}

export function update(table: string, id: number, data: Row): void {
  const set = Object.keys(data).map((k) => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id] as SQLiteBindValue[];
  try {
    getDatabase().runSync(`UPDATE ${table} SET ${set} WHERE id = ?`, ...values);
  } catch (e) {
    console.error(`[DB] update("${table}", ${id}) failed:`, e);
    throw e;
  }
}

export function remove(table: string, id: number): void {
  try {
    getDatabase().runSync(`DELETE FROM ${table} WHERE id = ?`, id);
  } catch (e) {
    console.error(`[DB] remove("${table}", ${id}) failed:`, e);
    throw e;
  }
}

export function query<T extends Row>(sql: string, ...params: SQLiteBindValue[]): T[] {
  try {
    return getDatabase().getAllSync<T>(sql, ...params);
  } catch (e) {
    console.error(`[DB] query failed — ${sql}:`, e);
    return [];
  }
}
