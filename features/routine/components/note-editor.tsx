import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ROUTINE_COLORS } from '../constants';
import { Note } from '../types';

interface NoteEditorProps {
  note: Note | null;
  onClose: () => void;
  onSave: (title: string, content: string, id?: number) => void;
}

export function NoteEditor({ note, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');

  return (
    <SafeAreaView style={s.editorScreen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.editorHeader}>
          <TouchableOpacity onPress={onClose} style={s.editorHeaderBtn}>
            <IconSymbol name="xmark" size={20} color={ROUTINE_COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={s.editorHeaderTitle}>{note ? 'Edit note' : 'New note'}</Text>
          <TouchableOpacity
            style={[s.editorHeaderBtn, s.editorSaveBtn]}
            onPress={() => {
              onSave(title, content, note?.id);
              onClose();
            }}
          >
            <Text style={s.editorSaveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={s.editorDivider} />

        <ScrollView
          style={s.editorScroll}
          contentContainerStyle={s.editorScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={s.editorTitle}
            placeholder="Title"
            placeholderTextColor={ROUTINE_COLORS.border}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <View style={s.editorSeparator} />
          <TextInput
            style={s.editorBody}
            placeholder="Write here..."
            placeholderTextColor={ROUTINE_COLORS.border}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus={!note}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  editorScreen: { flex: 1, backgroundColor: ROUTINE_COLORS.surfaceHigh },
  editorHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: ROUTINE_COLORS.borderLight,
  },
  editorHeaderBtn: { padding: 4, minWidth: 44, alignItems: 'center' },
  editorHeaderTitle: { fontSize: 15, fontWeight: '600', color: ROUTINE_COLORS.textSecondary },
  editorSaveBtn: {
    backgroundColor: ROUTINE_COLORS.accent, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 7, minWidth: 0,
  },
  editorSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  editorDivider: { height: 1, backgroundColor: ROUTINE_COLORS.borderLight },
  editorScroll: { flex: 1 },
  editorScrollContent: { padding: 22, paddingBottom: 60 },
  editorTitle: {
    fontSize: 24, fontWeight: '700', color: ROUTINE_COLORS.textPrimary,
    paddingVertical: 0, marginBottom: 16, letterSpacing: -0.3,
  },
  editorSeparator: { height: 1, backgroundColor: ROUTINE_COLORS.borderLight, marginBottom: 18 },
  editorBody: {
    fontSize: 16, color: ROUTINE_COLORS.textSecondary, lineHeight: 26,
    minHeight: 300, paddingVertical: 0,
  },
});
