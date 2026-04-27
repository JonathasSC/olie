import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius, Shadow } from '@/constants/design';
import { PRIORITY_COLOR, PRIORITY_LABEL, RECURRENCE_LABEL } from '../constants';
import { TaskEditorState, TaskPriority, TaskRecurrence, TaskSaveData } from '../types';
import { maskDate, maskTime } from '../utils/formatters';

interface TaskEditorModalProps {
  state: TaskEditorState;
  today: string;
  onClose: () => void;
  onSave: (data: TaskSaveData) => void;
}

const PRIORITIES: TaskPriority[] = ['low', 'normal', 'high'];
const RECURRENCES: TaskRecurrence[] = ['none', 'daily', 'weekly', 'monthly'];

export function TaskEditorModal({ state, today, onClose, onSave }: TaskEditorModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [recurrence, setRecurrence] = useState<TaskRecurrence>('none');
  const [reminderTime, setReminderTime] = useState('');

  useEffect(() => {
    if (state.isOpen) {
      setTitle(state.task?.title ?? '');
      setDate(state.task?.date ?? today);
      setPriority(state.task?.priority ?? 'normal');
      setRecurrence(state.task?.recurrence ?? 'none');
      setReminderTime(state.task?.reminder_time ?? '');
    }
  }, [state.isOpen, state.task, today]);

  function handleSave() {
    if (!title.trim()) return Alert.alert('Atenção', 'Informe o título da tarefa.');
    onSave({
      title: title.trim(),
      date,
      priority,
      recurrence,
      reminderTime: reminderTime.length === 5 ? reminderTime : null,
      id: state.task?.id,
    });
    onClose();
  }

  return (
    <Modal visible={state.isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ justifyContent: 'flex-end' }}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{state.task ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={20} color={Colors.t3} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.fieldLabel}>Título</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="O que precisa ser feito?"
              placeholderTextColor={Colors.t3}
              value={title}
              onChangeText={setTitle}
              autoFocus={!state.task}
              returnKeyType="done"
            />

            <Text style={styles.fieldLabel}>Data</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={Colors.t3}
              keyboardType="numeric"
              value={date}
              onChangeText={(text) => setDate(maskDate(text))}
              maxLength={10}
            />

            <Text style={styles.fieldLabel}>Prioridade</Text>
            <View style={styles.segmentRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.segmentOption, priority === p && { backgroundColor: PRIORITY_COLOR[p] + '22', borderColor: PRIORITY_COLOR[p] }]}
                  onPress={() => setPriority(p)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[p] }]} />
                  <Text style={[styles.segmentText, priority === p && { color: PRIORITY_COLOR[p] }]}>
                    {PRIORITY_LABEL[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Repetição</Text>
            <View style={styles.segmentRow}>
              {RECURRENCES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.segmentOption, recurrence === r && styles.segmentOptionActive]}
                  onPress={() => setRecurrence(r)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.segmentText, recurrence === r && styles.segmentTextActive]}>
                    {r === 'none' ? '—' : RECURRENCE_LABEL[r].replace('todo ', '').replace('toda ', '')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Lembrete (opcional)</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="HH:MM"
              placeholderTextColor={Colors.t3}
              keyboardType="numeric"
              value={reminderTime}
              onChangeText={(text) => setReminderTime(maskTime(text))}
              maxLength={5}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
              <Text style={styles.saveButtonText}>Salvar tarefa</Text>
            </TouchableOpacity>
            <View style={{ height: 16 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay },
  sheetContainer: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20, paddingBottom: 8, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.bdr,
    maxHeight: '85%',
  },
  dragHandle: { width: 36, height: 4, backgroundColor: Colors.bdr2, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontFamily: Fonts.display, fontSize: 22, color: Colors.t1, letterSpacing: -0.6 },
  fieldLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7, marginTop: 16 },
  fieldInput: {
    backgroundColor: Colors.bgSurf,
    borderWidth: 1.5, borderColor: Colors.bdr,
    borderRadius: Radius.sm,
    paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: Fonts.body, fontSize: 15, color: Colors.t1,
  },
  segmentRow: { flexDirection: 'row', gap: 6 },
  segmentOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.bdr,
    backgroundColor: Colors.bgSurf,
  },
  segmentOptionActive: { borderColor: Colors.brand, backgroundColor: 'rgba(124,111,255,0.12)' },
  segmentText: { fontFamily: Fonts.bodySb, fontSize: 12, color: Colors.t3 },
  segmentTextActive: { color: Colors.brandLt },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  saveButton: {
    backgroundColor: Colors.brand, borderRadius: Radius.md,
    paddingVertical: 15, alignItems: 'center', marginTop: 20,
    ...Shadow.brand,
  },
  saveButtonText: { fontFamily: Fonts.display, fontSize: 16, color: '#fff', letterSpacing: -0.2 },
});
