import * as SQLite from 'expo-sqlite';

export type Ganho = {
  id?: number;
  valor: number;
  categoria: string;
  tipo: string;
  data: string;
  criado_em?: string;
};

export type Gasto = {
  id?: number;
  valor: number;
  categoria: string;
  tipo: string;
  parcelas: number;
  data_compra: string;
  data_pagamento: string;
  criado_em?: string;
};

export type ItemLista = (Ganho | Gasto) & { natureza: 'ganho' | 'gasto' };

const db = SQLite.openDatabaseSync('olie.db');

db.execSync(
  `CREATE TABLE IF NOT EXISTS ganhos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    valor      REAL    NOT NULL,
    categoria  TEXT    NOT NULL,
    tipo       TEXT    NOT NULL,
    data       TEXT    NOT NULL,
    criado_em  TEXT    DEFAULT (datetime('now'))
  )`
);

db.execSync(
  `CREATE TABLE IF NOT EXISTS gastos (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    valor           REAL    NOT NULL,
    categoria       TEXT    NOT NULL,
    tipo            TEXT    NOT NULL,
    parcelas        INTEGER NOT NULL DEFAULT 1,
    data_compra     TEXT    NOT NULL,
    data_pagamento  TEXT    NOT NULL,
    criado_em       TEXT    DEFAULT (datetime('now'))
  )`
);

export function inserirGanho(ganho: Omit<Ganho, 'id' | 'criado_em'>): void {
  db.runSync(
    `INSERT INTO ganhos (valor, categoria, tipo, data) VALUES (?, ?, ?, ?)`,
    [ganho.valor, ganho.categoria, ganho.tipo, ganho.data]
  );
}

export function inserirGasto(gasto: Omit<Gasto, 'id' | 'criado_em'>): void {
  db.runSync(
    `INSERT INTO gastos (valor, categoria, tipo, parcelas, data_compra, data_pagamento)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [gasto.valor, gasto.categoria, gasto.tipo, gasto.parcelas, gasto.data_compra, gasto.data_pagamento]
  );
}

export function listarTudo(): ItemLista[] {
  const ganhos = db.getAllSync<Ganho>('SELECT * FROM ganhos');
  const gastos = db.getAllSync<Gasto>('SELECT * FROM gastos');

  return [
    ...ganhos.map((g) => ({ ...g, natureza: 'ganho' as const })),
    ...gastos.map((g) => ({ ...g, natureza: 'gasto' as const })),
  ].sort((a, b) => (b.criado_em ?? '').localeCompare(a.criado_em ?? ''));
}

export function deletarGanho(id: number): void {
  db.runSync('DELETE FROM ganhos WHERE id = ?', [id]);
}

export function deletarGasto(id: number): void {
  db.runSync('DELETE FROM gastos WHERE id = ?', [id]);
}

export function obterSaldo(): { totalGanhos: number; totalGastos: number; saldo: number } {
  const { total: totalGanhos } = db.getFirstSync<{ total: number }>(
    'SELECT COALESCE(SUM(valor), 0) AS total FROM ganhos'
  )!;
  const { total: totalGastos } = db.getFirstSync<{ total: number }>(
    'SELECT COALESCE(SUM(valor), 0) AS total FROM gastos'
  )!;
  return { totalGanhos, totalGastos, saldo: totalGanhos - totalGastos };
}
