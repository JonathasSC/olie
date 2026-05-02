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
import { RoutineRepository } from '../features/routine/services/routine-repository';
import { StreakRepository } from '../services/streak';

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const note = id ? RoutineRepository.listNotes().find((n) => n.id === Number(id)) : undefined;
  const isEdit = !!note;

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [saving, setSaving] = useState(false);

  function handleSave() {
    if (saving) return;
    setSaving(true);
    if (note?.id) {
      RoutineRepository.updateNote(note.id, title, content);
    } else {
      RoutineRepository.insertNote(title, content);
      StreakRepository.recordUsage();
    }
    router.back();
  }

  function handleDelete() {
    Alert.alert('Excluir nota', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          RoutineRepository.deleteNote(note!.id!);
          router.back();
        },
      },
    ]);
  }

  const rightAction = isEdit ? (
    <TouchableOpacity onPress={handleDelete} activeOpacity={0.7} style={styles.deleteButton}>
      <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
    </TouchableOpacity>
  ) : undefined;

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader title={isEdit ? 'Editar nota' : 'Nova nota'} rightAction={rightAction} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            style={styles.titleInput}
            placeholder="Título"
            placeholderTextColor="#ccc"
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <View style={styles.separator} />
          <TextInput
            style={styles.bodyInput}
            placeholder="Escreva aqui..."
            placeholderTextColor="#ccc"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            autoFocus={!note}
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
  titleInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    paddingVertical: 0,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 18,
  },
  bodyInput: {
    fontSize: 16,
    color: '#000',
    lineHeight: 26,
    minHeight: 300,
    paddingVertical: 0,
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
