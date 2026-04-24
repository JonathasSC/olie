import * as repository from '@/services/db/repository';
import { Note, TaskStatus, Task } from '../types';

export const RoutineRepository = {
  listAllTasks(): Task[] {
    return repository.findAll<Task>('tasks').sort((a, b) => {
      const order = { pending: 0, doing: 1, completed: 2 };
      return order[a.status] - order[b.status];
    });
  },

  listNotes(): Note[] {
    return repository.findAll<Note>('notes').sort((a, b) => 
      (b.updated_at ?? '').localeCompare(a.updated_at ?? '')
    );
  },

  insertTask(task: Omit<Task, 'id' | 'created_at'>): number {
    return repository.insert('tasks', task);
  },

  updateTask(id: number, title: string, date: string): void {
    repository.update('tasks', id, { title, date });
  },

  updateTaskStatus(id: number, status: TaskStatus): void {
    repository.update('tasks', id, { status });
  },

  deleteTask(id: number): void {
    repository.remove('tasks', id);
  },

  insertNote(title: string, content: string): number {
    return repository.insert('notes', { title, content });
  },

  updateNote(id: number, title: string, content: string): void {
    repository.update('notes', id, { 
      title, 
      content, 
      updated_at: new Date().toISOString().replace('T', ' ').split('.')[0] 
    });
  },

  deleteNote(id: number): void {
    repository.remove('notes', id);
  }
};
