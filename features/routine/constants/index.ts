import { TaskStatus } from '../types';

export const ROUTINE_COLORS = {
  bg:           '#0A0A0A',
  surface:      '#161616',
  surfaceHigh:  '#1E1E1E',
  surfaceInput: '#121212',
  border:        '#2C2C2C',
  borderLight:   '#222222',
  textPrimary:   '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted:     '#525252',
  accent:        '#0052CC',
  accentDark:    '#0747A6',
  accentSurface: 'rgba(0, 82, 204, 0.15)',
  task:        '#4C9AFF',
  taskSurface: 'rgba(76, 154, 255, 0.12)',
  warning:        '#FFAB00',
  warningSurface: 'rgba(255, 171, 0, 0.1)',
  statusPending: '#525252',
  statusDoing:   '#FFAB00',
  statusDone:    '#36B37E',
  overlay: 'rgba(0, 0, 0, 0.75)',
} as const;

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  pending: 'doing',
  doing: 'completed',
  completed: 'pending',
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pending',
  doing: 'In progress',
  completed: 'Completed',
};

export const STATUS_COLOR: Record<TaskStatus, string> = {
  pending:  ROUTINE_COLORS.statusPending,
  doing:   ROUTINE_COLORS.statusDoing,
  completed: ROUTINE_COLORS.statusDone,
};
