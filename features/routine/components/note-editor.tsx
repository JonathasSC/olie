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
import { Colors, Fonts, Radius, Shadow } from '@/constants/design';
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
    <SafeAreaView style={s.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.hdr}>
          <TouchableOpacity onPress={onClose} style={s.hdrBtn}>
            <IconSymbol name="xmark" size={20} color={Colors.t2} />
          </TouchableOpacity>
          <Text style={s.hdrTitle}>{note ? 'Editar nota' : 'Nova nota'}</Text>
          <TouchableOpacity
            style={s.saveBtn}
            onPress={() => { onSave(title, content, note?.id); onClose(); }}
          >
            <Text style={s.saveTxt}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <View style={s.divider} />

        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={s.titleInput}
            placeholder="Título"
            placeholderTextColor={Colors.bdr2}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
            blurOnSubmit={false}
          />
          <View style={s.sep} />
          <TextInput
            style={s.bodyInput}
            placeholder="Escreva aqui..."
            placeholderTextColor={Colors.bdr2}
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
  screen: { flex: 1, backgroundColor: Colors.bgCard },
  hdr: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  hdrBtn: { padding: 4, minWidth: 44, alignItems: 'center' },
  hdrTitle: { fontFamily: Fonts.bodySb, fontSize: 15, color: Colors.t2 },
  saveBtn: { backgroundColor: Colors.brand, borderRadius: Radius.pill, paddingHorizontal: 16, paddingVertical: 7 },
  saveTxt: { fontFamily: Fonts.bodyBd, fontSize: 14, color: '#fff' },
  divider: { height: 1, backgroundColor: Colors.bdr },
  scroll: { flex: 1 },
  scrollContent: { padding: 22, paddingBottom: 60 },
  titleInput: {
    fontFamily: Fonts.heading, fontSize: 24, color: Colors.t1,
    paddingVertical: 0, marginBottom: 16, letterSpacing: -0.3,
  },
  sep: { height: 1, backgroundColor: Colors.bdr, marginBottom: 18 },
  bodyInput: {
    fontFamily: Fonts.body, fontSize: 16, color: Colors.t2, lineHeight: 26,
    minHeight: 300, paddingVertical: 0,
  },
});
