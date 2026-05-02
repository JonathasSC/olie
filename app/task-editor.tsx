import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ScreenHeader from '../components/screen-header';
import { PRIORITY_LABEL, RECURRENCE_LABEL } from '../features/routine/constants';
import { RoutineRepository } from '../features/routine/services/routine-repository';
import { TaskPriority, TaskRecurrence } from '../features/routine/types';
import { getTodayDate, maskDate, maskTime } from '../features/routine/utils/formatters';
import { NotificationService } from '../services/notifications';
import { StreakRepository } from '../services/streak';

const PRIORITIES: TaskPriority[] = ['low', 'normal', 'high'];
const RECURRENCES: TaskRecurrence[] = ['none', 'daily', 'weekly', 'monthly'];

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: '#8a8a8a',
  normal: '#000',
  high: '#ff6e6e',
};

export default function TaskEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const task = id ? RoutineRepository.listAllTasks().find((t) => t.id === Number(id)) : undefined;
  const today = getTodayDate();

  const [title, setTitle] = useState(task?.title ?? '');
  const [date, setDate] = useState(task?.date ?? today);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'normal');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>(task?.recurrence ?? 'none');
  const [reminderTime, setReminderTime] = useState(task?.reminder_time ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (saving) return;
    if (!title.trim()) return Alert.alert('Atenção', 'Informe o título da tarefa.');
    setSaving(true);

    const resolvedReminder = reminderTime.length === 5 ? reminderTime : null;
    const data = {
      title: title.trim(),
      date,
      priority,
      recurrence,
      reminder_time: resolvedReminder,
    };

    if (task?.id) {
      try {
        if (task.notification_id) {
          await NotificationService.cancelReminder(task.notification_id);
          RoutineRepository.updateNotificationId(task.id, null);
        }
        RoutineRepository.updateTask(task.id, data);
      } catch {
        setSaving(false);
        Alert.alert('Erro', 'Não foi possível salvar a tarefa. Tente novamente.');
        return;
      }
      if (resolvedReminder) {
        try {
          const notifId = await NotificationService.scheduleTaskReminder({ ...task, ...data });
          if (notifId) RoutineRepository.updateNotificationId(task.id, notifId);
        } catch {
          Alert.alert('Atenção', 'Tarefa salva, mas o lembrete não pôde ser agendado.');
        }
      }
    } else {
      let newId: number;
      try {
        newId = RoutineRepository.insertTask({ ...data, status: 'pending' });
        StreakRepository.recordUsage();
      } catch {
        setSaving(false);
        Alert.alert('Erro', 'Não foi possível criar a tarefa. Tente novamente.');
        return;
      }
      if (resolvedReminder) {
        try {
          const newTask = { id: newId, ...data, status: 'pending' as const };
          const notifId = await NotificationService.scheduleTaskReminder(newTask);
          if (notifId) RoutineRepository.updateNotificationId(newId, notifId);
        } catch {
          Alert.alert('Atenção', 'Tarefa criada, mas o lembrete não pôde ser agendado.');
        }
      }
    }
    router.back();
  }

  function handleDelete() {
    Alert.alert('Excluir tarefa', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          RoutineRepository.deleteTask(task!.id!);
          router.back();
        },
      },
    ]);
  }

  const rightAction = task?.id ? (
    <TouchableOpacity onPress={handleDelete} activeOpacity={0.7} style={styles.deleteButton}>
      <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
    </TouchableOpacity>
  ) : undefined;

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader title={task ? 'Editar Tarefa' : 'Nova Tarefa'} rightAction={rightAction} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.fieldLabel}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="O que precisa ser feito?"
            placeholderTextColor="#aaa"
            value={title}
            onChangeText={setTitle}
            autoFocus={!task}
            returnKeyType="done"
          />

          <Text style={styles.fieldLabel}>Data</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={date}
            onChangeText={(v) => setDate(maskDate(v))}
            maxLength={10}
          />

          <Text style={styles.fieldLabel}>Prioridade</Text>
          <View style={styles.segmentRow}>
            {PRIORITIES.map((p) => {
              const active = priority === p;
              const color = PRIORITY_COLOR[p];
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.segment, active && { borderColor: color, backgroundColor: color + '18' }]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.priorityDot, { backgroundColor: color }]} />
                  <Text style={[styles.segmentText, active && { color, fontWeight: '600' }]}>
                    {PRIORITY_LABEL[p]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Repetição</Text>
          <View style={styles.segmentRow}>
            {RECURRENCES.map((r) => {
              const active = recurrence === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setRecurrence(r)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {r === 'none' ? '—' : RECURRENCE_LABEL[r].replace('todo ', '').replace('toda ', '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Lembrete (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={reminderTime}
            onChangeText={(v) => setReminderTime(maskTime(v))}
            maxLength={5}
          />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
          >
            <Text style={styles.saveText}>{saving ? 'Salvando...' : 'Salvar'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#8a8a8a',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#000',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#f5f5f5',
  },
  segmentActive: {
    borderColor: '#000',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8a8a8a',
  },
  segmentTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deleteButton: {
    padding: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#555',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
