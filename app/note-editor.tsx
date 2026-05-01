import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function NoteEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const note = id ? RoutineRepository.listNotes().find((n) => n.id === Number(id)) : undefined;

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');

  function handleSave() {
    if (note?.id) {
      RoutineRepository.updateNote(note.id, title, content);
    } else {
      RoutineRepository.insertNote(title, content);
    }
    router.back();
  }

  const saveAction = (
    <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
      <Text style={styles.saveButtonText}>Salvar</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenHeader title={note ? 'Editar nota' : 'Nova nota'} rightAction={saveAction} />

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
    paddingBottom: 60,
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
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
