export type TaskStatus = 'pending' | 'doing' | 'completed';

export interface Task {
  id?: number;
  title: string;
  status: TaskStatus;
  date: string;
  created_at?: string;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export type TaskEditorState = { isOpen: boolean; task: Task | null };
export type NoteEditorState = { isOpen: boolean; note: Note | null };
