import { getDatabase } from '@/services/db';
import * as repository from '@/services/db/repository';
import { Note, Task, TaskPriority, TaskRecurrence, TaskStatus } from '../types';

function shouldRecurToday(template: Task, today: string): boolean {
  if (template.recurrence === 'daily') return true;

  const [tDay, tMonth, tYear] = template.date.split('/').map(Number);
  const [dDay, dMonth, dYear] = today.split('/').map(Number);

  const templateDate = new Date(tYear, tMonth - 1, tDay);
  const todayDate = new Date(dYear, dMonth - 1, dDay);

  if (todayDate < templateDate) return false;
  if (template.recurrence === 'weekly') return templateDate.getDay() === todayDate.getDay();
  if (template.recurrence === 'monthly') return templateDate.getDate() === todayDate.getDate();
  return false;
}

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

  ensureRecurringInstancesForToday(today: string): void {
    const db = getDatabase();
    const templates = db.getAllSync<Task>(
      `SELECT * FROM tasks WHERE recurrence != 'none' AND origin_task_id IS NULL`
    );
    for (const tmpl of templates) {
      if (!shouldRecurToday(tmpl, today)) continue;
      const existing = db.getFirstSync(
        `SELECT id FROM tasks WHERE origin_task_id = ? AND date = ?`,
        tmpl.id!, today
      );
      if (existing) continue;
      db.runSync(
        `INSERT INTO tasks (title, status, date, priority, recurrence, reminder_time, origin_task_id, notification_id)
         VALUES (?, 'pending', ?, ?, 'none', ?, ?, NULL)`,
        tmpl.title, today, tmpl.priority ?? 'normal', tmpl.reminder_time ?? null, tmpl.id!
      );
    }
  },

  insertTask(task: Omit<Task, 'id' | 'created_at'>): number {
    return repository.insert('tasks', task);
  },

  updateTask(id: number, data: { title: string; date: string; priority: TaskPriority; recurrence: TaskRecurrence; reminder_time: string | null }): void {
    repository.update('tasks', id, data);
  },

  updateTaskStatus(id: number, status: TaskStatus): void {
    repository.update('tasks', id, { status });
  },

  updateNotificationId(id: number, notificationId: string | null): void {
    repository.update('tasks', id, { notification_id: notificationId });
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
      updated_at: new Date().toISOString().replace('T', ' ').split('.')[0],
    });
  },

  deleteNote(id: number): void {
    repository.remove('notes', id);
  },
};
