import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ROUTINE_COLORS } from '../constants';
import { TaskEditorState } from '../types';
import { maskDate } from '../utils/formatters';

interface TaskEditorModalProps {
  state: TaskEditorState;
  today: string;
  onClose: () => void;
  onSave: (title: string, date: string, id?: number) => void;
}

export function TaskEditorModal({ state, today, onClose, onSave }: TaskEditorModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);

  useEffect(() => {
    if (state.isOpen) {
      setTitle(state.task?.title ?? '');
      setDate(state.task?.date ?? today);
    }
  }, [state.isOpen, state.task, today]);

  function handleSave() {
    if (!title.trim()) return Alert.alert('Attention', 'Enter the task title.');
    onSave(title.trim(), date, state.task?.id);
    onClose();
  }

  return (
    <Modal visible={state.isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.kav}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>{state.task ? 'Edit task' : 'New task'}</Text>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={20} color={ROUTINE_COLORS.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={s.label}>Title</Text>
          <TextInput
            style={s.input}
            placeholder="What do you need to do?"
            placeholderTextColor={ROUTINE_COLORS.textMuted}
            value={title}
            onChangeText={setTitle}
            autoFocus={!state.task}
            returnKeyType="done"
          />
          <Text style={s.label}>Date</Text>
          <TextInput
            style={s.input}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={ROUTINE_COLORS.textMuted}
            keyboardType="numeric"
            value={date}
            onChangeText={(t) => setDate(maskDate(t))}
            maxLength={10}
          />
          <TouchableOpacity style={s.saveButton} onPress={handleSave}>
            <Text style={s.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: ROUTINE_COLORS.overlay },
  kav: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: ROUTINE_COLORS.surfaceHigh, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12,
  },
  handle: { width: 36, height: 4, backgroundColor: ROUTINE_COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 22 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: ROUTINE_COLORS.textPrimary },
  label: { fontSize: 12, fontWeight: '700', color: ROUTINE_COLORS.textMuted, marginBottom: 8, marginTop: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  input: {
    borderWidth: 1.5, borderColor: ROUTINE_COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: ROUTINE_COLORS.textPrimary, marginBottom: 16, backgroundColor: ROUTINE_COLORS.surfaceInput,
  },
  saveButton: { backgroundColor: ROUTINE_COLORS.accent, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 4 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
