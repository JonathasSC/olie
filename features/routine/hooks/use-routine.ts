import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Note, Task, TaskSaveData, TaskStatus } from '../types';
import { RoutineRepository } from '../services/routine-repository';
import { RoutineService } from '../services/routine-service';
import { NEXT_STATUS } from '../constants';
import { getTodayDate } from '../utils/formatters';
import { StreakRepository } from '@/services/streak';
import { NotificationService } from '@/services/notifications';

export function useRoutine() {
  const today = getTodayDate();
  const [allTasks, setAllTasks] = useState<Task[]>(() => {
    RoutineRepository.ensureRecurringInstancesForToday(getTodayDate());
    return RoutineRepository.listAllTasks();
  });
  const [notes, setNotes] = useState<Note[]>(() => RoutineRepository.listNotes());
  const [search, setSearch] = useState('');

  const refresh = useCallback(() => {
    RoutineRepository.ensureRecurringInstancesForToday(getTodayDate());
    setAllTasks(RoutineRepository.listAllTasks());
    setNotes(RoutineRepository.listNotes());
  }, []);

  const displayedTasks = useMemo(() =>
    RoutineService.filterTasks(allTasks, search, today),
    [allTasks, search, today]
  );

  const displayedNotes = useMemo(() =>
    RoutineService.filterNotes(notes, search),
    [notes, search]
  );

  const addTask = useCallback(async (data: TaskSaveData) => {
    const id = RoutineRepository.insertTask({
      title: data.title,
      status: 'pending',
      date: data.date,
      priority: data.priority,
      recurrence: data.recurrence,
      reminder_time: data.reminderTime,
    });
    StreakRepository.recordUsage();

    if (data.reminderTime) {
      const task: Task = { id, title: data.title, status: 'pending', date: data.date, priority: data.priority, recurrence: data.recurrence, reminder_time: data.reminderTime };
      const notifId = await NotificationService.scheduleTaskReminder(task);
      if (notifId) RoutineRepository.updateNotificationId(id, notifId);
    }

    refresh();
  }, [refresh]);

  const editTask = useCallback(async (data: TaskSaveData) => {
    if (!data.id) return;

    const existing = allTasks.find(t => t.id === data.id);
    if (existing?.notification_id) {
      await NotificationService.cancelReminder(existing.notification_id);
      RoutineRepository.updateNotificationId(data.id, null);
    }

    RoutineRepository.updateTask(data.id, {
      title: data.title,
      date: data.date,
      priority: data.priority,
      recurrence: data.recurrence,
      reminder_time: data.reminderTime,
    });

    if (data.reminderTime) {
      const task: Task = { id: data.id, title: data.title, status: 'pending', date: data.date, priority: data.priority, recurrence: data.recurrence, reminder_time: data.reminderTime };
      const notifId = await NotificationService.scheduleTaskReminder(task);
      if (notifId) RoutineRepository.updateNotificationId(data.id, notifId);
    }

    refresh();
  }, [refresh, allTasks]);

  const cycleStatus = useCallback((task: Task) => {
    if (!task.id) return;
    RoutineRepository.updateTaskStatus(task.id, NEXT_STATUS[task.status]);
    refresh();
  }, [refresh]);

  const removeTask = useCallback(async (id: number) => {
    const task = allTasks.find(t => t.id === id);
    Alert.alert('Remover tarefa', 'Deseja remover esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive', onPress: async () => {
          if (task?.notification_id) await NotificationService.cancelReminder(task.notification_id);
          RoutineRepository.deleteTask(id);
          refresh();
        },
      },
    ]);
  }, [refresh, allTasks]);

  const saveNote = useCallback((title: string, content: string, id?: number) => {
    if (!title.trim() && !content.trim()) return false;
    if (id) {
      RoutineRepository.updateNote(id, title.trim(), content);
    } else {
      RoutineRepository.insertNote(title.trim() || 'Untitled', content);
      StreakRepository.recordUsage();
    }
    refresh();
    return true;
  }, [refresh]);

  const removeNote = useCallback((id: number) => {
    Alert.alert('Remover nota', 'Deseja remover esta nota?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { RoutineRepository.deleteNote(id); refresh(); } },
    ]);
  }, [refresh]);

  return {
    displayedTasks,
    displayedNotes,
    search,
    setSearch,
    today,
    addTask,
    editTask,
    cycleStatus,
    removeTask,
    saveNote,
    removeNote,
  };
}
