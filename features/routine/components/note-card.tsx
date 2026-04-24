import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius } from '@/constants/design';
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
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.75}>
      <View style={s.top}>
        <Text style={s.title} numberOfLines={1}>
          {hasTitle ? note.title : 'Sem título'}
        </Text>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconSymbol name="trash" size={14} color={Colors.t3} />
        </TouchableOpacity>
      </View>
      {hasContent && (
        <Text style={s.preview} numberOfLines={2}>{note.content}</Text>
      )}
      <Text style={s.date}>{formatNoteDate(note.updated_at)}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(155,138,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(155,138,255,0.18)',
    borderRadius: Radius.md, padding: 14, marginBottom: 8, gap: 4,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  title: { fontFamily: Fonts.bodyBd, fontSize: 14, color: '#C4B5FD', flex: 1 },
  preview: { fontFamily: Fonts.body, fontSize: 12, color: 'rgba(155,138,255,0.6)', lineHeight: 18 },
  date: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, marginTop: 2 },
});
