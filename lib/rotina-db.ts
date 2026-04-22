import * as SQLite from 'expo-sqlite';

export type StatusTarefa = 'pendente' | 'fazendo' | 'concluido';

export type Tarefa = {
  id?: number;
  titulo: string;
  status: StatusTarefa;
  data: string; // DD/MM/YYYY
  criado_em?: string;
};

export type Nota = {
  id?: number;
  titulo: string;
  conteudo: string;
  criado_em?: string;
  atualizado_em?: string;
};

const db = SQLite.openDatabaseSync('olie.db');

db.execSync(
  `CREATE TABLE IF NOT EXISTS tarefas (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo    TEXT    NOT NULL,
    status    TEXT    NOT NULL DEFAULT 'pendente',
    data      TEXT    NOT NULL,
    criado_em TEXT    DEFAULT (datetime('now'))
  )`
);

db.execSync(
  `CREATE TABLE IF NOT EXISTS notas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo        TEXT    NOT NULL DEFAULT '',
    conteudo      TEXT    NOT NULL DEFAULT '',
    criado_em     TEXT    DEFAULT (datetime('now')),
    atualizado_em TEXT    DEFAULT (datetime('now'))
  )`
);

// ─── tarefas ──────────────────────────────────────────────────────────────────

export function inserirTarefa(t: Omit<Tarefa, 'id' | 'criado_em'>): void {
  db.runSync(
    `INSERT INTO tarefas (titulo, status, data) VALUES (?, ?, ?)`,
    [t.titulo, t.status, t.data]
  );
}

export function atualizarStatusTarefa(id: number, status: StatusTarefa): void {
  db.runSync('UPDATE tarefas SET status = ? WHERE id = ?', [status, id]);
}

export function atualizarTarefa(id: number, titulo: string, data: string): void {
  db.runSync('UPDATE tarefas SET titulo = ?, data = ? WHERE id = ?', [titulo, data, id]);
}

export function deletarTarefa(id: number): void {
  db.runSync('DELETE FROM tarefas WHERE id = ?', [id]);
}

export function listarTodasTarefas(): Tarefa[] {
  return db.getAllSync<Tarefa>(
    `SELECT * FROM tarefas
     ORDER BY CASE status WHEN 'pendente' THEN 0 WHEN 'fazendo' THEN 1 ELSE 2 END, criado_em ASC`
  );
}

// ─── notas ────────────────────────────────────────────────────────────────────

export function inserirNota(titulo: string, conteudo: string): void {
  db.runSync(`INSERT INTO notas (titulo, conteudo) VALUES (?, ?)`, [titulo, conteudo]);
}

export function atualizarNota(id: number, titulo: string, conteudo: string): void {
  db.runSync(
    `UPDATE notas SET titulo = ?, conteudo = ?, atualizado_em = datetime('now') WHERE id = ?`,
    [titulo, conteudo, id]
  );
}

export function deletarNota(id: number): void {
  db.runSync('DELETE FROM notas WHERE id = ?', [id]);
}

export function listarNotas(): Nota[] {
  return db.getAllSync<Nota>('SELECT * FROM notas ORDER BY atualizado_em DESC');
}
