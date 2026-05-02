import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ScreenHeader from '../../components/screen-header';
import { TAB_HEIGHT } from '../../constants/design';
import { ChoiceSheet } from '../../features/routine/components/choice-sheet';
import { NoteCard } from '../../features/routine/components/note-card';
import { TaskCard } from '../../features/routine/components/task-card';
import { useRoutine } from '../../features/routine/hooks/use-routine';

export default function RoutineScreen() {
  const {
    displayedTasks,
    displayedNotes,
    search,
    setSearch,
    today,
    refresh,
    addTask,
    cycleStatus,
    removeTask,
    removeNote,
  } = useRoutine();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);

  function handleCreateQuickTask() {
    if (!quickTaskTitle.trim()) return;
    addTask({ title: quickTaskTitle.trim(), date: today, priority: 'normal', recurrence: 'none', reminderTime: null });
    setQuickTaskTitle('');
  }

  function openTaskEditor() {
    setIsChoiceOpen(false);
    router.push('/task-editor');
  }

  function openNoteEditor() {
    setIsChoiceOpen(false);
    router.push('/note-editor');
  }

  const createButton = (
    <TouchableOpacity activeOpacity={0.85} onPress={() => setIsChoiceOpen(true)}>
      <Ionicons name="add" size={22} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Rotina" rightAction={createButton} />

      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#8a8a8a" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tarefas e notas..."
            placeholderTextColor="#8a8a8a"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#8a8a8a" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Atividades</Text>
        </View>

        {!search && (
          <View style={styles.quickAddRow}>
            <TextInput
              style={styles.quickAddInput}
              placeholder="Nova tarefa rápida..."
              placeholderTextColor="#8a8a8a"
              value={quickTaskTitle}
              onChangeText={setQuickTaskTitle}
              onSubmitEditing={handleCreateQuickTask}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            {quickTaskTitle.trim().length > 0 && (
              <TouchableOpacity onPress={handleCreateQuickTask} style={styles.quickAddButton}>
                <Ionicons name="add-circle" size={24} color="#000" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {displayedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={42} color="#e0e0e0" />
            <Text style={styles.emptyStateText}>
              {search ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa para hoje'}
            </Text>
          </View>
        ) : (
          displayedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onCycleStatus={() => cycleStatus(task)}
              onEdit={() => router.push(`/task-editor?id=${task.id}`)}
              onDelete={() => task.id && removeTask(task.id)}
              today={today}
            />
          ))
        )}

        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <TouchableOpacity style={styles.sectionAction} onPress={openNoteEditor}>
            <Ionicons name="add" size={16} color="#555" />
            <Text style={styles.sectionActionText}>Nova nota</Text>
          </TouchableOpacity>
        </View>

        {displayedNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={42} color="#e0e0e0" />
            <Text style={styles.emptyStateText}>
              {search ? 'Nenhuma nota encontrada' : 'Nenhuma nota criada'}
            </Text>
          </View>
        ) : (
          displayedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPress={() => router.push(`/note-editor?id=${note.id}`)}
              onDelete={() => note.id && removeNote(note.id)}
            />
          ))
        )}

        <View style={{ height: TAB_HEIGHT + 80 }} />
      </ScrollView>

      <ChoiceSheet
        visible={isChoiceOpen}
        onClose={() => setIsChoiceOpen(false)}
        onSelectTask={openTaskEditor}
        onSelectNote={openNoteEditor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchWrapper: {
    padding: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionActionText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#555',
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quickAddInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 13,
  },
  quickAddButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#8a8a8a',
  },
});
