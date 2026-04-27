import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius, Shadow, TAB_HEIGHT } from '@/constants/design';

import { ChoiceSheet } from '@/features/routine/components/choice-sheet';
import { NoteCard } from '@/features/routine/components/note-card';
import { NoteEditor } from '@/features/routine/components/note-editor';
import { TaskCard } from '@/features/routine/components/task-card';
import { TaskEditorModal } from '@/features/routine/components/task-editor-modal';
import { useRoutine } from '@/features/routine/hooks/use-routine';
import { NoteEditorState, TaskEditorState } from '@/features/routine/types';
import { getTodayDateLong } from '@/features/routine/utils/formatters';

export default function RoutineScreen() {
  const {
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
  } = useRoutine();

  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [isChoiceOpen, setIsChoiceOpen] = useState(false);
  const [taskEditor, setTaskEditor] = useState<TaskEditorState>({ isOpen: false, task: null });
  const [noteEditor, setNoteEditor] = useState<NoteEditorState>({ isOpen: false, note: null });

  function handleCreateQuickTask() {
    if (!quickTaskTitle.trim()) return;
    addTask({ title: quickTaskTitle.trim(), date: today, priority: 'normal', recurrence: 'none', reminderTime: null });
    setQuickTaskTitle('');
  }

  function openTaskEditor() {
    setIsChoiceOpen(false);
    setTaskEditor({ isOpen: true, task: null });
  }

  function openNoteEditor() {
    setIsChoiceOpen(false);
    setNoteEditor({ isOpen: true, note: null });
  }

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={16} color={Colors.t3} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar tarefas e notas..."
            placeholderTextColor={Colors.t3}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <IconSymbol name="xmark" size={14} color={Colors.t3} />
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
          <Text style={styles.sectionSubtitle}>{getTodayDateLong()}</Text>
        </View>

        {!search && (
          <View style={styles.quickAddRow}>
            <TextInput
              style={styles.quickAddInput}
              placeholder="Nova tarefa rápida..."
              placeholderTextColor={Colors.t3}
              value={quickTaskTitle}
              onChangeText={setQuickTaskTitle}
              onSubmitEditing={handleCreateQuickTask}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            {quickTaskTitle.trim().length > 0 && (
              <TouchableOpacity onPress={handleCreateQuickTask} style={styles.quickAddButton}>
                <IconSymbol name="plus.circle.fill" size={20} color={Colors.brand} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {displayedTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="checkmark.circle" size={32} color={Colors.bdr} />
            <Text style={styles.emptyStateText}>{search ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa para hoje'}</Text>
          </View>
        ) : (
          displayedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onCycleStatus={() => cycleStatus(task)}
              onEdit={() => setTaskEditor({ isOpen: true, task })}
              onDelete={() => task.id && removeTask(task.id)}
              today={today}
            />
          ))
        )}

        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Notas</Text>
          <TouchableOpacity style={styles.sectionAction} onPress={() => setNoteEditor({ isOpen: true, note: null })}>
            <IconSymbol name="plus" size={14} color={Colors.brandLt} />
            <Text style={styles.sectionActionText}>Nova nota</Text>
          </TouchableOpacity>
        </View>

        {displayedNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="note.text" size={32} color={Colors.bdr} />
            <Text style={styles.emptyStateText}>{search ? 'Nenhuma nota encontrada' : 'Nenhuma nota criada'}</Text>
          </View>
        ) : (
          displayedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPress={() => setNoteEditor({ isOpen: true, note })}
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

      <TaskEditorModal
        state={taskEditor}
        today={today}
        onClose={() => setTaskEditor({ isOpen: false, task: null })}
        onSave={(data) => {
          if (data.id) editTask(data);
          else addTask(data);
        }}
      />

      <Modal
        visible={noteEditor.isOpen}
        animationType="slide"
        onRequestClose={() => setNoteEditor({ isOpen: false, note: null })}
      >
        <NoteEditor
          note={noteEditor.note}
          onClose={() => setNoteEditor({ isOpen: false, note: null })}
          onSave={(title, content, id) => saveNote(title, content, id)}
        />
      </Modal>

      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fabButton} activeOpacity={0.85} onPress={() => setIsChoiceOpen(true)}>
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={styles.fabText}>Criar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  searchWrapper: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: Colors.bg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1.5, borderColor: Colors.bdr,
  },
  searchInput: { flex: 1, fontFamily: Fonts.body, fontSize: 14, color: Colors.t1 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.t1, letterSpacing: -0.4 },
  sectionSubtitle: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.t3 },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionActionText: { fontFamily: Fonts.bodySb, fontSize: 13, color: Colors.brandLt },

  quickAddRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 2,
    marginBottom: 12, borderWidth: 1.5, borderColor: Colors.bdr,
  },
  quickAddInput: { flex: 1, fontFamily: Fonts.body, fontSize: 14, color: Colors.t1, paddingVertical: 13 },
  quickAddButton: { padding: 6 },

  emptyState: { 
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8
  },

  emptyStateText: { 
    fontFamily: Fonts.body,
    fontSize: 14,
    color: Colors.t3 
  },

  fabWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16 
  },
  
  fabButton: {
    gap: 8,
    paddingVertical: 16, 
    alignItems: 'center', 
    flexDirection: 'row',
    borderRadius: Radius.xs,
    justifyContent: 'center', 
    backgroundColor: Colors.brand, 
    ...Shadow.brand,
  },
  fabText: { fontFamily: Fonts.display, fontSize: 16, color: '#fff', letterSpacing: -0.2 },
});
