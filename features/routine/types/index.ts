export type TaskStatus = 'pending' | 'doing' | 'completed';
export type TaskPriority = 'low' | 'normal' | 'high';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id?: number;
  title: string;
  status: TaskStatus;
  date: string;
  priority: TaskPriority;
  recurrence: TaskRecurrence;
  reminder_time?: string | null;
  origin_task_id?: number | null;
  notification_id?: string | null;
  created_at?: string;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastUsedDate: string | null;
}

export type TaskEditorState = { isOpen: boolean; task: Task | null };
export type NoteEditorState = { isOpen: boolean; note: Note | null };

export type TaskSaveData = {
  title: string;
  date: string;
  priority: TaskPriority;
  recurrence: TaskRecurrence;
  reminderTime: string | null;
  id?: number;
};
