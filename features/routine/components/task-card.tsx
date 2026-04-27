import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius } from '@/constants/design';
import { PRIORITY_COLOR, RECURRENCE_LABEL, ROUTINE_COLORS, STATUS_COLOR, STATUS_LABEL } from '../constants';
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
              <IconSymbol name="repeat" size={9} color={Colors.brandLt} />
              <Text style={styles.recurrenceText}>{RECURRENCE_LABEL[recurrence]}</Text>
            </View>
          )}
          {task.reminder_time && (
            <View style={styles.reminderBadge}>
              <IconSymbol name="clock.fill" size={9} color={Colors.note} />
              <Text style={styles.reminderText}>{task.reminder_time}</Text>
            </View>
          )}
          {task.date !== today && (
            <Text style={styles.dateText}>{task.date}</Text>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <IconSymbol name="pencil" size={16} color={Colors.t3} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <IconSymbol name="trash" size={16} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function pillBackground(status: Task['status']) {
  if (status === 'completed') return 'rgba(78,203,163,0.10)';
  if (status === 'doing') return 'rgba(245,185,78,0.10)';
  return 'rgba(70,72,112,0.30)';
}

function pillBorderColor(status: Task['status']) {
  if (status === 'completed') return 'rgba(78,203,163,0.30)';
  if (status === 'doing') return 'rgba(245,185,78,0.30)';
  return Colors.bdr;
}

function StatusCircle({ status }: { status: Task['status'] }) {
  const isDone = status === 'completed';
  const isDoing = status === 'doing';
  const backgroundColor = isDone ? Colors.income : isDoing ? 'rgba(245,185,78,0.12)' : 'transparent';
  const borderColor = isDone ? Colors.income : isDoing ? Colors.note : Colors.t3;

  return (
    <View style={[styles.statusCircle, { backgroundColor, borderColor }]}>
      {isDone && <IconSymbol name="checkmark" size={11} color="#fff" />}
      {isDoing && <View style={styles.doingDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    paddingVertical: 13, paddingRight: 14,
    marginBottom: 8,
    borderWidth: 1, borderColor: Colors.bdr,
    overflow: 'hidden',
  },
  cardDoing: { borderColor: 'rgba(245,185,78,0.25)' },
  cardDone: { opacity: 0.7 },
  priorityBar: { width: 3, alignSelf: 'stretch', marginRight: 2 },
  statusCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  doingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.note },
  taskBody: { flex: 1, gap: 5 },
  taskTitle: { fontFamily: Fonts.bodySb, fontSize: 14, color: Colors.t1, lineHeight: 19 },
  taskTitleDone: { color: Colors.t3, textDecorationLine: 'line-through' },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  statusPill: {
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statusPillText: { fontFamily: Fonts.bodyBd, fontSize: 10, letterSpacing: 0.2 },
  recurrenceBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: 'rgba(124,111,255,0.10)', borderWidth: 1, borderColor: 'rgba(124,111,255,0.20)' },
  recurrenceText: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.brandLt },
  reminderBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: Radius.pill, backgroundColor: 'rgba(245,185,78,0.10)', borderWidth: 1, borderColor: 'rgba(245,185,78,0.20)' },
  reminderText: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.note },
  dateText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3 },
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionButton: { padding: 4, borderRadius: 8 },
});
