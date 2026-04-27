import { RoutineRepository } from '../routine-repository';
import { runMigrations } from '@/services/db/migrations';
import { createTestDb } from '@/services/db/__tests__/create-test-db';
import type { SQLiteDatabase } from 'expo-sqlite';

jest.mock('@/services/db/database', () => ({ getDatabase: jest.fn() }));

import { getDatabase } from '@/services/db/database';

let db: SQLiteDatabase;

beforeEach(() => {
  db = createTestDb();
  runMigrations(db);
  (getDatabase as jest.Mock).mockReturnValue(db);
});

afterEach(() => {
  (db as any).closeSync();
});

const sampleTask = { title: 'Estudar', status: 'pending' as const, date: '2024-01-10', priority: 'normal' as const, recurrence: 'none' as const };
const sampleNote = { title: 'Ideia', content: 'Conteúdo da nota' };

describe('RoutineRepository — tasks', () => {
  it('listAllTasks retorna array vazio inicialmente', () => {
    expect(RoutineRepository.listAllTasks()).toHaveLength(0);
  });

  it('insertTask insere e retorna id', () => {
    const id = RoutineRepository.insertTask(sampleTask);
    expect(id).toBeGreaterThan(0);
  });

  it('listAllTasks retorna as tasks inseridas', () => {
    RoutineRepository.insertTask(sampleTask);
    RoutineRepository.insertTask({ title: 'Correr', status: 'doing', date: '2024-01-11', priority: 'normal', recurrence: 'none' });

    const list = RoutineRepository.listAllTasks();
    expect(list).toHaveLength(2);
    expect(list.map((t) => t.title)).toEqual(expect.arrayContaining(['Estudar', 'Correr']));
  });

  it('listAllTasks ordena: pending → doing → completed', () => {
    RoutineRepository.insertTask({ title: 'C', status: 'completed', date: '2024-01-01', priority: 'normal', recurrence: 'none' });
    RoutineRepository.insertTask({ title: 'D', status: 'doing', date: '2024-01-01', priority: 'normal', recurrence: 'none' });
    RoutineRepository.insertTask({ title: 'P', status: 'pending', date: '2024-01-01', priority: 'normal', recurrence: 'none' });

    const list = RoutineRepository.listAllTasks();
    expect(list.map((t) => t.status)).toEqual(['pending', 'doing', 'completed']);
  });

  it('updateTask altera título e data', () => {
    const id = RoutineRepository.insertTask(sampleTask);
    RoutineRepository.updateTask(id, { title: 'Novo título', date: '2024-06-01', priority: 'normal', recurrence: 'none', reminder_time: null });

    const tasks = RoutineRepository.listAllTasks();
    const updated = tasks.find((t) => t.id === id);
    expect(updated).toMatchObject({ title: 'Novo título', date: '2024-06-01' });
  });

  it('updateTaskStatus altera apenas o status', () => {
    const id = RoutineRepository.insertTask(sampleTask);
    RoutineRepository.updateTaskStatus(id, 'completed');

    const tasks = RoutineRepository.listAllTasks();
    const updated = tasks.find((t) => t.id === id);
    expect(updated?.status).toBe('completed');
    expect(updated?.title).toBe(sampleTask.title);
  });

  it('deleteTask remove o registro', () => {
    const id = RoutineRepository.insertTask(sampleTask);
    RoutineRepository.deleteTask(id);
    expect(RoutineRepository.listAllTasks()).toHaveLength(0);
  });

  it('deleteTask remove apenas a task alvo', () => {
    const id1 = RoutineRepository.insertTask(sampleTask);
    RoutineRepository.insertTask({ title: 'Outra', status: 'pending', date: '2024-01-12', priority: 'normal', recurrence: 'none' });
    RoutineRepository.deleteTask(id1);
    expect(RoutineRepository.listAllTasks()).toHaveLength(1);
    expect(RoutineRepository.listAllTasks()[0].title).toBe('Outra');
  });
});

describe('RoutineRepository — notes', () => {
  it('listNotes retorna array vazio inicialmente', () => {
    expect(RoutineRepository.listNotes()).toHaveLength(0);
  });

  it('insertNote insere e retorna id', () => {
    const id = RoutineRepository.insertNote(sampleNote.title, sampleNote.content);
    expect(id).toBeGreaterThan(0);
  });

  it('listNotes retorna as notas inseridas', () => {
    RoutineRepository.insertNote('Nota 1', 'Conteúdo 1');
    RoutineRepository.insertNote('Nota 2', 'Conteúdo 2');

    const list = RoutineRepository.listNotes();
    expect(list).toHaveLength(2);
    expect(list.map((n) => n.title)).toEqual(expect.arrayContaining(['Nota 1', 'Nota 2']));
  });

  it('updateNote altera título e conteúdo', () => {
    const id = RoutineRepository.insertNote(sampleNote.title, sampleNote.content);
    RoutineRepository.updateNote(id, 'Título atualizado', 'Conteúdo atualizado');

    const notes = RoutineRepository.listNotes();
    const updated = notes.find((n) => n.id === id);
    expect(updated).toMatchObject({
      title: 'Título atualizado',
      content: 'Conteúdo atualizado',
    });
  });

  it('updateNote atualiza o campo updated_at', () => {
    const id = RoutineRepository.insertNote(sampleNote.title, sampleNote.content);
    const before = RoutineRepository.listNotes().find((n) => n.id === id)?.updated_at;

    jest.useFakeTimers().setSystemTime(new Date('2000-01-01T00:00:00.000Z'));
    RoutineRepository.updateNote(id, 'X', 'Y');
    jest.useRealTimers();

    const after = RoutineRepository.listNotes().find((n) => n.id === id)?.updated_at;
    expect(after).not.toBeUndefined();
    expect(after).not.toBe(before);
  });

  it('deleteNote remove o registro', () => {
    const id = RoutineRepository.insertNote(sampleNote.title, sampleNote.content);
    RoutineRepository.deleteNote(id);
    expect(RoutineRepository.listNotes()).toHaveLength(0);
  });

  it('deleteNote remove apenas a nota alvo', () => {
    const id1 = RoutineRepository.insertNote('A', 'conteúdo A');
    RoutineRepository.insertNote('B', 'conteúdo B');
    RoutineRepository.deleteNote(id1);

    const notes = RoutineRepository.listNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0].title).toBe('B');
  });
});
