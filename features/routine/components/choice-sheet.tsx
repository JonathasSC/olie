import { Ionicons } from '@expo/vector-icons';
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          <Text style={styles.title}>O que deseja criar?</Text>

          <TouchableOpacity style={styles.option} onPress={onSelectTask} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle-outline" size={22} color="#000" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Nova Tarefa</Text>
              <Text style={styles.optionSubtitle}>Adicionar à rotina diária</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8a8a8a" />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.option} onPress={onSelectNote} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={22} color="#000" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Nova Nota</Text>
              <Text style={styles.optionSubtitle}>Capturar uma ideia ou informação</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#8a8a8a" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  kav: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
});
