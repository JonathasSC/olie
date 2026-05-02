import { Colors } from '@/constants/design';
import { TaskPriority, TaskRecurrence, TaskStatus } from '../types';

export const ROUTINE_COLORS = {
  bg:           Colors.bg,
  surface:      Colors.bgCard,
  surfaceHigh:  Colors.bgCard,
  surfaceInput: Colors.bgSurf,
  border:       Colors.bdr,
  borderLight:  Colors.bdr,
  bdr2:         Colors.bdr2,
  textPrimary:   Colors.t1,
  textSecondary: Colors.t2,
  textMuted:     Colors.t3,
  accent:        Colors.brand,
  accentDark:    Colors.brand,
  accentSurface: Colors.brandDim,
  task:          Colors.task,
  taskSurface:   Colors.taskSurf,
  warning:       Colors.note,
  warningSurface: Colors.noteSurf,
  statusPending: Colors.t3,
  statusDoing:   Colors.note,
  statusDone:    Colors.income,
  overlay:       Colors.overlay,
} as const;

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'baixa',
  normal: 'normal',
  high: 'alta',
};

export const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: '#8a8a8a',
  normal: '#000',
  high: '#ff6e6e',
};

export const RECURRENCE_LABEL: Record<TaskRecurrence, string> = {
  none: 'não repete',
  daily: 'todo dia',
  weekly: 'toda semana',
  monthly: 'todo mês',
};

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  pending: 'doing',
  doing: 'completed',
  completed: 'pending',
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'Pendente',
  doing: 'Andamento',
  completed: 'Feito',
};

export const STATUS_COLOR: Record<TaskStatus, string> = {
  pending:   '#8a8a8a',
  doing:     '#f1863f',
  completed: '#2ada73',
};
