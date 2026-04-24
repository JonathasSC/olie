import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedView } from '@/components/themed-view';
import { shadowMd } from '@/constants/design';

import { useRoutine } from '@/features/routine/hooks/use-routine';
import { ROUTINE_COLORS } from '@/features/routine/constants';
import { getTodayDateLong } from '@/features/routine/utils/formatters';
import { TaskCard } from '@/features/routine/components/task-card';
import { NoteCard } from '@/features/routine/components/note-card';
import { TaskEditorModal } from '@/features/routine/components/task-editor-modal';
import { NoteEditor } from '@/features/routine/components/note-editor';
import { NoteEditorState, TaskEditorState } from '@/features/routine/types';
import { PressableScale } from '@/components/ui/pressable-scale';

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
    addTask(quickTaskTitle.trim(), today);
    setQuickTaskTitle('');
  }

  return (
    <ThemedView style={s.screen} lightColor={ROUTINE_COLORS.bg} darkColor={ROUTINE_COLORS.bg}>
      {/* search */}
      <View style={s.searchContainer}>
        <View style={s.searchBar}>
          <IconSymbol name="magnifyingglass" size={16} color={ROUTINE_COLORS.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search tasks and notes..."
            placeholderTextColor={ROUTINE_COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <IconSymbol name="xmark" size={14} color={ROUTINE_COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Activities</Text>
          {!search && <Text style={s.sectionSub}>{getTodayDateLong()}</Text>}
        </View>

        {!search && (
          <View style={s.quickAdd}>
            <TextInput
              style={s.quickAddInput}
              placeholder="New task..."
              placeholderTextColor={ROUTINE_COLORS.textMuted}
              value={quickTaskTitle}
              onChangeText={setQuickTaskTitle}
              onSubmitEditing={handleCreateQuickTask}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            {quickTaskTitle.trim().length > 0 && (
              <TouchableOpacity style={s.quickAddBtn} onPress={handleCreateQuickTask}>
                <IconSymbol name="plus" size={18} color={ROUTINE_COLORS.task} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {displayedTasks.length === 0 ? (
          <View style={s.empty}>
            <IconSymbol name="list.bullet" size={28} color={ROUTINE_COLORS.border} />
            <Text style={s.emptyText}>
              {search ? 'No tasks found' : 'No tasks for today'}
            </Text>
          </View>
        ) : (
          displayedTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onCycleStatus={() => cycleStatus(t)}
              onEdit={() => setTaskEditor({ isOpen: true, task: t })}
              onDelete={() => t.id && removeTask(t.id)}
              today={today}
            />
          ))
        )}

        <View style={[s.sectionHeader, { marginTop: 24 }]}>
          <Text style={s.sectionTitle}>Notes</Text>
          <TouchableOpacity
            style={s.newNoteBtn}
            onPress={() => setNoteEditor({ isOpen: true, note: null })}
          >
            <IconSymbol name="plus" size={14} color={ROUTINE_COLORS.task} />
            <Text style={s.newNoteText}>New note</Text>
          </TouchableOpacity>
        </View>

        {displayedNotes.length === 0 ? (
          <View style={s.empty}>
            <IconSymbol name="note.text" size={28} color={ROUTINE_COLORS.border} />
            <Text style={s.emptyText}>
              {search ? 'No notes found' : 'No notes created'}
            </Text>
          </View>
        ) : (
          displayedNotes.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onPress={() => setNoteEditor({ isOpen: true, note: n })}
              onDelete={() => n.id && removeNote(n.id)}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={s.btnWrap}>
        <PressableScale style={s.btnCreate} onPress={() => setIsChoiceOpen(true)}>
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={s.btnCreateText}>Create</Text>
        </PressableScale>
      </View>

      {/* choice modal */}
      <Modal visible={isChoiceOpen} animationType="slide" transparent onRequestClose={() => setIsChoiceOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsChoiceOpen(false)}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.choiceTitle}>What do you want to create?</Text>
          <TouchableOpacity
            style={[s.choiceCard, { borderColor: ROUTINE_COLORS.task }]}
            onPress={() => { setIsChoiceOpen(false); setTaskEditor({ isOpen: true, task: null }); }}
          >
            <View style={[s.choiceIcon, { backgroundColor: ROUTINE_COLORS.taskSurface }]}>
              <IconSymbol name="list.bullet" size={24} color={ROUTINE_COLORS.task} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.choiceCardTitle, { color: ROUTINE_COLORS.task }]}>New Task</Text>
              <Text style={s.choiceCardSub}>Add to your daily routine</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={ROUTINE_COLORS.task} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.choiceCard, { borderColor: ROUTINE_COLORS.warning }]}
            onPress={() => { setIsChoiceOpen(false); setNoteEditor({ isOpen: true, note: null }); }}
          >
            <View style={[s.choiceIcon, { backgroundColor: ROUTINE_COLORS.warningSurface }]}>
              <IconSymbol name="note.text" size={24} color={ROUTINE_COLORS.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.choiceCardTitle, { color: ROUTINE_COLORS.warning }]}>New Note</Text>
              <Text style={s.choiceCardSub}>Capture an idea or information</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={ROUTINE_COLORS.warning} />
          </TouchableOpacity>
        </View>
      </Modal>

      <TaskEditorModal
        state={taskEditor}
        today={today}
        onClose={() => setTaskEditor({ isOpen: false, task: null })}
        onSave={(title, date, id) => {
          if (id) editTask(id, title, date);
          else addTask(title, date);
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
          onSave={(t, c, id) => saveNote(t, c, id)}
        />
      </Modal>
    </ThemedView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: ROUTINE_COLORS.bg },
  searchContainer: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: ROUTINE_COLORS.bg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: ROUTINE_COLORS.surface, borderRadius: 13,
    paddingHorizontal: 12, paddingVertical: 11,
    borderWidth: 1.5, borderColor: ROUTINE_COLORS.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: ROUTINE_COLORS.textPrimary, padding: 0 },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: ROUTINE_COLORS.textPrimary, letterSpacing: -0.3 },
  sectionSub: { fontSize: 12, color: ROUTINE_COLORS.textMuted, fontWeight: '600', letterSpacing: 0.2 },
  quickAdd: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: ROUTINE_COLORS.surface, borderRadius: 13,
    paddingHorizontal: 14, paddingVertical: 2,
    marginBottom: 10, borderWidth: 1.5, borderColor: ROUTINE_COLORS.border,
  },
  quickAddInput: { flex: 1, fontSize: 14, color: ROUTINE_COLORS.textPrimary, paddingVertical: 12 },
  quickAddBtn: { padding: 6 },
  empty: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  emptyText: { fontSize: 14, color: ROUTINE_COLORS.textMuted, textAlign: 'center' },
  newNoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  newNoteText: { fontSize: 13, fontWeight: '600', color: ROUTINE_COLORS.task },
  btnWrap: { position: 'absolute', bottom: 24, left: 16, right: 16 },
  btnCreate: {
    backgroundColor: ROUTINE_COLORS.accent, borderRadius: 16,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    ...shadowMd, shadowColor: ROUTINE_COLORS.accentDark,
  },
  btnCreateText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 },
  overlay: { flex: 1, backgroundColor: ROUTINE_COLORS.overlay },
  sheet: {
    backgroundColor: ROUTINE_COLORS.surfaceHigh, borderTopLeftRadius: 26, borderTopRightRadius: 26,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12,
  },
  handle: { width: 36, height: 4, backgroundColor: ROUTINE_COLORS.border, borderRadius: 2, alignSelf: 'center', marginBottom: 22 },
  choiceTitle: { fontSize: 19, fontWeight: '700', color: ROUTINE_COLORS.textPrimary, marginBottom: 16 },
  choiceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5, borderRadius: 16, padding: 16, marginBottom: 12,
    backgroundColor: ROUTINE_COLORS.surface,
  },
  choiceIcon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  choiceCardTitle: { fontSize: 16, fontWeight: '700' },
  choiceCardSub: { fontSize: 12, color: ROUTINE_COLORS.textMuted, marginTop: 2 },
});
