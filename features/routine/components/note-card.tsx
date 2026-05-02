import { Fonts } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {hasTitle ? note.title : 'Sem título'}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#ccc" />
      </View>
      {hasContent && (
        <Text style={styles.notePreview} numberOfLines={2}>{note.content}</Text>
      )}
      <Text style={styles.noteDate}>{formatNoteDate(note.updated_at)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    gap: 4,
    backgroundColor: '#fff',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  noteTitle: {
    fontFamily: Fonts.bodyBd,
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
    flex: 1,
  },
  notePreview: { fontFamily: Fonts.body, fontSize: 12, color: '#8a8a8a', lineHeight: 18 },
  noteDate: { fontFamily: Fonts.mono, fontSize: 10, color: '#aaa', marginTop: 2 },
});
