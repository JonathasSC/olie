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
import { Colors, Fonts, Radius, Shadow } from '@/constants/design';
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
    if (!title.trim()) return Alert.alert('Atenção', 'Informe o título da tarefa.');
    onSave(title.trim(), date, state.task?.id);
    onClose();
  }

  return (
    <Modal visible={state.isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ justifyContent: 'flex-end' }}>
        <View style={s.sheet}>
          <View style={s.handle} />
          <View style={s.hdr}>
            <Text style={s.title}>{state.task ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>
            <TouchableOpacity onPress={onClose}>
              <IconSymbol name="xmark" size={20} color={Colors.t3} />
            </TouchableOpacity>
          </View>

          <Text style={s.lbl}>Título</Text>
          <TextInput
            style={s.input}
            placeholder="O que precisa ser feito?"
            placeholderTextColor={Colors.t3}
            value={title}
            onChangeText={setTitle}
            autoFocus={!state.task}
            returnKeyType="done"
          />

          <Text style={s.lbl}>Data</Text>
          <TextInput
            style={s.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={Colors.t3}
            keyboardType="numeric"
            value={date}
            onChangeText={(t) => setDate(maskDate(t))}
            maxLength={10}
          />

          <TouchableOpacity style={s.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={s.saveTxt}>Salvar tarefa</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.bdr,
  },
  handle: { width: 36, height: 4, backgroundColor: Colors.bdr2, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  title: { fontFamily: Fonts.display, fontSize: 22, color: Colors.t1, letterSpacing: -0.6 },
  lbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7, marginTop: 16 },
  input: {
    backgroundColor: Colors.bgSurf,
    borderWidth: 1.5, borderColor: Colors.bdr,
    borderRadius: Radius.sm,
    paddingHorizontal: 14, paddingVertical: 13,
    fontFamily: Fonts.body, fontSize: 15, color: Colors.t1,
  },
  saveBtn: {
    backgroundColor: Colors.brand, borderRadius: Radius.md,
    paddingVertical: 15, alignItems: 'center', marginTop: 20,
    ...Shadow.brand,
  },
  saveTxt: { fontFamily: Fonts.display, fontSize: 16, color: '#fff', letterSpacing: -0.2 },
});
