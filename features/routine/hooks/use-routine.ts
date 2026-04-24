import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Note, TaskStatus, Task } from '../types';
import { RoutineRepository } from '../services/routine-repository';
import { RoutineService } from '../services/routine-service';
import { NEXT_STATUS } from '../constants';
import { getTodayDate } from '../utils/formatters';

export function useRoutine() {
  const today = getTodayDate();
  const [allTasks, setAllTasks] = useState<Task[]>(() => RoutineRepository.listAllTasks());
  const [notes, setNotes] = useState<Note[]>(() => RoutineRepository.listNotes());
  const [search, setSearch] = useState('');

  const refresh = useCallback(() => {
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

  const addTask = useCallback((title: string, date: string) => {
    RoutineRepository.insertTask({ title, status: 'pending', date });
    refresh();
  }, [refresh]);

  const editTask = useCallback((id: number, title: string, date: string) => {
    RoutineRepository.updateTask(id, title, date);
    refresh();
  }, [refresh]);

  const cycleStatus = useCallback((task: Task) => {
    if (!task.id) return;
    RoutineRepository.updateTaskStatus(task.id, NEXT_STATUS[task.status]);
    refresh();
  }, [refresh]);

  const removeTask = useCallback((id: number) => {
    Alert.alert('Remove task', 'Do you want to remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { RoutineRepository.deleteTask(id); refresh(); } },
    ]);
  }, [refresh]);

  const saveNote = useCallback((title: string, content: string, id?: number) => {
    if (!title.trim() && !content.trim()) return false;
    
    if (id) {
      RoutineRepository.updateNote(id, title.trim(), content);
    } else {
      RoutineRepository.insertNote(title.trim() || 'Untitled', content);
    }
    refresh();
    return true;
  }, [refresh]);

  const removeNote = useCallback((id: number) => {
    Alert.alert('Remove note', 'Do you want to remove this note?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { RoutineRepository.deleteNote(id); refresh(); } },
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
