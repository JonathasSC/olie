import { getDatabase } from './database';
import type { SQLiteBindValue } from 'expo-sqlite';

type Row = Record<string, any>;

export function findAll<T extends Row>(table: string): T[] {
  return getDatabase().getAllSync<T>(`SELECT * FROM ${table}`);
}

export function findById<T extends Row>(table: string, id: number): T | null {
  return getDatabase().getFirstSync<T>(`SELECT * FROM ${table} WHERE id = ?`, id) ?? null;
}

export function insert(table: string, data: Row): number {
  const keys = Object.keys(data);
  const placeholders = keys.map(() => '?').join(', ');
  const values = Object.values(data) as SQLiteBindValue[];

  const result = getDatabase().runSync(
    `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
    ...values
  );

  return result.lastInsertRowId;
}

export function update(table: string, id: number, data: Row): void {
  const set = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(data), id] as SQLiteBindValue[];

  getDatabase().runSync(`UPDATE ${table} SET ${set} WHERE id = ?`, ...values);
}

export function remove(table: string, id: number): void {
  getDatabase().runSync(`DELETE FROM ${table} WHERE id = ?`, id);
}

export function query<T extends Row>(sql: string, ...params: SQLiteBindValue[]): T[] {
  return getDatabase().getAllSync<T>(sql, ...params);
}
