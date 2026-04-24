import { Note, Task } from '../types';

export const RoutineService = {
  filterTasks(tasks: Task[], q: string, today: string): Task[] {
    const query = q.trim().toLowerCase();
    if (!query) {
      return tasks.filter((t) => t.date === today);
    }
    return tasks.filter((t) => t.title.toLowerCase().includes(query));
  },

  filterNotes(notes: Note[], q: string): Note[] {
    const query = q.trim().toLowerCase();
    if (!query) return notes;
    return notes.filter(
      (n) => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query)
    );
  }
};
