import { Colors } from '@/constants/design';
import { TaskStatus } from '../types';

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

export const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  pending: 'doing',
  doing: 'completed',
  completed: 'pending',
};

export const STATUS_LABEL: Record<TaskStatus, string> = {
  pending: 'pendente',
  doing: 'em progresso',
  completed: 'concluído',
};

export const STATUS_COLOR: Record<TaskStatus, string> = {
  pending:   ROUTINE_COLORS.statusPending,
  doing:     ROUTINE_COLORS.statusDoing,
  completed: ROUTINE_COLORS.statusDone,
};
