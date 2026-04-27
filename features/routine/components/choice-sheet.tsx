import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius } from '@/constants/design';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectTask: () => void;
  onSelectNote: () => void;
};

export function ChoiceSheet({ visible, onClose, onSelectTask, onSelectNote }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ justifyContent: 'flex-end' }}>
        <View style={styles.sheetContainer}>
          <View style={styles.dragHandle} />
          <Text style={styles.sheetTitle}>O que deseja criar?</Text>

          <TouchableOpacity
            style={[styles.optionCard, { borderColor: 'rgba(124,111,255,0.4)' }]}
            onPress={onSelectTask}
          >
            <View style={[styles.optionIconWrapper, { backgroundColor: Colors.brandDim }]}>
              <IconSymbol name="checkmark.circle.fill" size={26} color={Colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: Colors.brandLt }]}>Nova Tarefa</Text>
              <Text style={styles.optionSubtitle}>Adicionar à rotina diária</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, { borderColor: 'rgba(245,185,78,0.35)' }]}
            onPress={onSelectNote}
          >
            <View style={[styles.optionIconWrapper, { backgroundColor: Colors.noteSurf }]}>
              <IconSymbol name="note.text" size={26} color={Colors.note} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.optionTitle, { color: Colors.note }]}>Nova Nota</Text>
              <Text style={styles.optionSubtitle}>Capturar uma ideia ou informação</Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay },
  sheetContainer: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingBottom: 44,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.bdr,
  },
  dragHandle: { width: 36, height: 4, backgroundColor: Colors.bdr2, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontFamily: Fonts.display, fontSize: 22, color: Colors.t1, letterSpacing: -0.6, marginBottom: 18 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, borderRadius: Radius.md,
    borderWidth: 1.5, marginBottom: 10,
    backgroundColor: Colors.bgSurf,
  },
  optionIconWrapper: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  optionTitle: { fontFamily: Fonts.heading, fontSize: 16 },
  optionSubtitle: { fontFamily: Fonts.body, fontSize: 12, color: Colors.t3, marginTop: 2 },
});
