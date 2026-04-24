import React, { useState } from 'react';
import {
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
import { Colors, Fonts, Radius, Shadow, TAB_HEIGHT } from '@/constants/design';

import { useRoutine } from '@/features/routine/hooks/use-routine';
import { ROUTINE_COLORS } from '@/features/routine/constants';
import { getTodayDateLong } from '@/features/routine/utils/formatters';
import { TaskCard } from '@/features/routine/components/task-card';
import { NoteCard } from '@/features/routine/components/note-card';
import { TaskEditorModal } from '@/features/routine/components/task-editor-modal';
import { NoteEditor } from '@/features/routine/components/note-editor';
import { NoteEditorState, TaskEditorState } from '@/features/routine/types';

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
    <View style={s.screen}>
      {/* Search header */}
      <View style={s.searchWrap}>
        <View style={s.searchBar}>
          <IconSymbol name="magnifyingglass" size={16} color={Colors.t3} />
          <TextInput
            style={s.searchInput}
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
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tasks section */}
        <View style={s.secHdr}>
          <Text style={s.secTitle}>Atividades</Text>
          <Text style={s.secSub}>{getTodayDateLong()}</Text>
        </View>

        {!search && (
          <View style={s.quickAdd}>
            <TextInput
              style={s.quickAddInput}
              placeholder="Nova tarefa rápida..."
              placeholderTextColor={Colors.t3}
              value={quickTaskTitle}
              onChangeText={setQuickTaskTitle}
              onSubmitEditing={handleCreateQuickTask}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            {quickTaskTitle.trim().length > 0 && (
              <TouchableOpacity onPress={handleCreateQuickTask} style={s.quickAddBtn}>
                <IconSymbol name="plus.circle.fill" size={20} color={Colors.brand} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {displayedTasks.length === 0 ? (
          <View style={s.empty}>
            <IconSymbol name="checkmark.circle" size={32} color={Colors.bdr} />
            <Text style={s.emptyTxt}>{search ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa para hoje'}</Text>
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

        {/* Notes section */}
        <View style={[s.secHdr, { marginTop: 24 }]}>
          <Text style={s.secTitle}>Notas</Text>
          <TouchableOpacity style={s.secAction} onPress={() => setNoteEditor({ isOpen: true, note: null })}>
            <IconSymbol name="plus" size={14} color={Colors.brandLt} />
            <Text style={s.secActionTxt}>Nova nota</Text>
          </TouchableOpacity>
        </View>

        {displayedNotes.length === 0 ? (
          <View style={s.empty}>
            <IconSymbol name="note.text" size={32} color={Colors.bdr} />
            <Text style={s.emptyTxt}>{search ? 'Nenhuma nota encontrada' : 'Nenhuma nota criada'}</Text>
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

        <View style={{ height: TAB_HEIGHT + 80 }} />
      </ScrollView>

      {/* FAB */}
      <View style={s.fabWrap}>
        <TouchableOpacity style={s.fabBtn} activeOpacity={0.85} onPress={() => setIsChoiceOpen(true)}>
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={s.fabTxt}>Criar</Text>
        </TouchableOpacity>
      </View>

      {/* Choice sheet */}
      <Modal visible={isChoiceOpen} animationType="slide" transparent onRequestClose={() => setIsChoiceOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsChoiceOpen(false)}>
          <View style={s.overlay} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ justifyContent: 'flex-end' }}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>O que deseja criar?</Text>

            <TouchableOpacity
              style={[s.choiceCard, { borderColor: 'rgba(124,111,255,0.4)' }]}
              onPress={() => { setIsChoiceOpen(false); setTaskEditor({ isOpen: true, task: null }); }}
            >
              <View style={[s.choiceIco, { backgroundColor: Colors.brandDim }]}>
                <IconSymbol name="checkmark.circle.fill" size={26} color={Colors.brand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.choiceCardTitle, { color: Colors.brandLt }]}>Nova Tarefa</Text>
                <Text style={s.choiceCardSub}>Adicionar à rotina diária</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.choiceCard, { borderColor: 'rgba(245,185,78,0.35)' }]}
              onPress={() => { setIsChoiceOpen(false); setNoteEditor({ isOpen: true, note: null }); }}
            >
              <View style={[s.choiceIco, { backgroundColor: Colors.noteSurf }]}>
                <IconSymbol name="note.text" size={26} color={Colors.note} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.choiceCardTitle, { color: Colors.note }]}>Nova Nota</Text>
                <Text style={s.choiceCardSub}>Capturar uma ideia ou informação</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  searchWrap: { paddingTop: 54, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: Colors.bg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1.5, borderColor: Colors.bdr,
  },
  searchInput: { flex: 1, fontFamily: Fonts.body, fontSize: 14, color: Colors.t1 },

  scroll: { paddingHorizontal: 16, paddingTop: 4 },

  secHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  secTitle: { fontFamily: Fonts.heading, fontSize: 18, color: Colors.t1, letterSpacing: -0.4 },
  secSub: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.t3 },
  secAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  secActionTxt: { fontFamily: Fonts.bodySb, fontSize: 13, color: Colors.brandLt },

  quickAdd: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingHorizontal: 14, paddingVertical: 2,
    marginBottom: 12, borderWidth: 1.5, borderColor: Colors.bdr,
  },
  quickAddInput: { flex: 1, fontFamily: Fonts.body, fontSize: 14, color: Colors.t1, paddingVertical: 13 },
  quickAddBtn: { padding: 6 },

  empty: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyTxt: { fontFamily: Fonts.body, fontSize: 14, color: Colors.t3 },

  fabWrap: { position: 'absolute', bottom: TAB_HEIGHT + 14, left: 16, right: 16 },
  fabBtn: {
    backgroundColor: Colors.brand, borderRadius: Radius.md,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    ...Shadow.brand,
  },
  fabTxt: { fontFamily: Fonts.display, fontSize: 16, color: '#fff', letterSpacing: -0.2 },

  overlay: { flex: 1, backgroundColor: Colors.overlay },
  sheet: {
    backgroundColor: Colors.bgCard, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.bdr,
  },
  handle: { width: 36, height: 4, backgroundColor: Colors.bdr2, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontFamily: Fonts.display, fontSize: 22, color: Colors.t1, letterSpacing: -0.6, marginBottom: 18 },
  choiceCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: Radius.md,
    borderWidth: 1.5, marginBottom: 10,
    backgroundColor: Colors.bgSurf,
  },
  choiceIco: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  choiceCardTitle: { fontFamily: Fonts.heading, fontSize: 16 },
  choiceCardSub: { fontFamily: Fonts.body, fontSize: 12, color: Colors.t3, marginTop: 2 },
});
