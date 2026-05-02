import { Fonts } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PRIORITY_COLOR, RECURRENCE_LABEL, STATUS_COLOR, STATUS_LABEL } from '../constants';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onCycleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  today: string;
}

export function TaskCard({ task, onCycleStatus, onEdit, onDelete, today }: TaskCardProps) {
  const { status, priority = 'normal', recurrence = 'none' } = task;

  const isDone = status === 'completed';
  const isDoing = status === 'doing';
  
  const priorityColor = PRIORITY_COLOR[priority];
  const showRecurrence = recurrence !== 'none' && !task.origin_task_id;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isDoing && styles.cardDoing,
        isDone && styles.cardDone,
      ]}
      onPress={onEdit}
      activeOpacity={0.75}
    >
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onCycleStatus();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <StatusCircle status={status} />
      </TouchableOpacity>

      <View style={styles.taskBody}>
        <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]} numberOfLines={2}>
          {task.title}
        </Text>

        <View style={styles.taskMetaRow}>
          <View style={[styles.statusPill, { backgroundColor: pillBackground(status), borderColor: pillBorderColor(status) }]}>
            <Text style={[styles.statusPillText, { color: STATUS_COLOR[status] }]}>
              {STATUS_LABEL[status]}
            </Text>
          </View>

          {showRecurrence && (
            <View style={styles.recurrenceBadge}>
              <Ionicons name="repeat" size={9} color="#7C6FFF" />
              <Text style={styles.recurrenceText}>{RECURRENCE_LABEL[recurrence]}</Text>
            </View>
          )}
          {task.reminder_time && (
            <View style={styles.reminderBadge}>
              <Ionicons name="time-sharp" size={9} color="#F5B94E" />
              <Text style={styles.reminderText}>{task.reminder_time}</Text>
            </View>
          )}
          {task.date !== today && (
            <Text style={styles.dateText}>{task.date}</Text>
          )}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={14} color="#ccc" />

    </TouchableOpacity>
  );
}

function pillBackground(status: Task['status']) {
  if (status === 'completed') return '#2dda731a';
  if (status === 'doing') return '#f5b94e1a';
  return '#f5f5f5';
}

function pillBorderColor(status: Task['status']) {
  if (status === 'completed') return '#2dda734d';
  if (status === 'doing') return '#f5b94e4d';
  return '#e0e0e0';
}

function StatusCircle({ status }: { status: Task['status'] }) {
  const isDone = status === 'completed';
  const isDoing = status === 'doing';
  const backgroundColor = isDone ? '#2ada73' : isDoing ? '#f5b94e1f' : '#d4d4d4';
  const borderColor = isDone ? '#2ada73' : isDoing ? '#ffdd55' : '#ffffff';

  return (
    <View style={[styles.statusCircle, { backgroundColor, borderColor }]}>
      {isDone && <Ionicons name="checkmark-sharp" size={12} color="#fff" />}
      {isDoing && <View style={styles.doingDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 8,
    paddingVertical: 13, paddingRight: 14,
    marginBottom: 8,
    borderWidth: 1, borderColor: '#f0f0f0',
    overflow: 'hidden',
  },
  cardDoing: { borderColor: 'rgba(245,185,78,0.40)' },
  cardDone: { opacity: 0.6 },
  priorityBar: { width: 3, alignSelf: 'stretch', marginRight: 2 },
  statusCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  doingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#ffdd55' },
  taskBody: { flex: 1, gap: 5 },
  taskTitle: { fontFamily: Fonts.bodySb, fontSize: 14, color: '#000', lineHeight: 19 },
  taskTitleDone: { color: '#8a8a8a', textDecorationLine: 'line-through' },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  statusPill: {
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: { fontFamily: Fonts.bodyBd, fontSize: 10, letterSpacing: 0.2 },
  recurrenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(124,111,255,0.08)', borderWidth: 1, borderColor: 'rgba(124,111,255,0.20)' },
  recurrenceText: { fontFamily: Fonts.mono, fontSize: 9, color: '#7C6FFF' },
  reminderBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999, backgroundColor: 'rgba(245,185,78,0.10)', borderWidth: 1, borderColor: 'rgba(245,185,78,0.20)' },
  reminderText: { fontFamily: Fonts.mono, fontSize: 9, color: '#F5B94E' },
  dateText: { fontFamily: Fonts.mono, fontSize: 10, color: '#8a8a8a' },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
