import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ROUTINE_COLORS } from '../constants';
import { Note } from '../types';
import { formatNoteDate } from '../utils/formatters';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  const hasTitle = note.title.trim().length > 0;
  const hasContent = note.content.trim().length > 0;
  return (
    <TouchableOpacity style={s.noteCard} onPress={onPress} onLongPress={onDelete} activeOpacity={0.7}>
      <View style={s.noteCardTop}>
        <Text style={s.noteTitle} numberOfLines={1}>
          {hasTitle ? note.title : 'Untitled'}
        </Text>
        <Text style={s.noteDate}>{formatNoteDate(note.updated_at)}</Text>
      </View>
      {hasContent && (
        <Text style={s.notePreview} numberOfLines={2}>{note.content}</Text>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  noteCard: {
    backgroundColor: ROUTINE_COLORS.surface,
    borderRadius: 14, padding: 14,
    marginBottom: 10, gap: 6,
    borderLeftWidth: 3, borderLeftColor: ROUTINE_COLORS.warning,
    borderWidth: 1, borderColor: ROUTINE_COLORS.border,
  },
  noteCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteTitle: { fontSize: 14, fontWeight: '600', color: ROUTINE_COLORS.textPrimary, flex: 1 },
  noteDate: { fontSize: 11, color: ROUTINE_COLORS.textMuted, marginLeft: 8, fontWeight: '500' },
  notePreview: { fontSize: 13, color: ROUTINE_COLORS.textSecondary, lineHeight: 19 },
});
