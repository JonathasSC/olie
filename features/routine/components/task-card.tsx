import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ROUTINE_COLORS, STATUS_COLOR, STATUS_LABEL } from '../constants';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onCycleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  today: string;
}

export function TaskCard({ task, onCycleStatus, onEdit, onDelete, today }: TaskCardProps) {
  const completed = task.status === 'completed';
  return (
    <TouchableOpacity
      style={[s.taskCard, completed && s.taskCardCompleted]}
      onPress={onEdit}
      onLongPress={onDelete}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onCycleStatus();
        }} 
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <StatusCircle status={task.status} />
      </TouchableOpacity>
      <View style={s.taskMiddle}>
        <Text style={[s.taskTitle, completed && s.taskTitleStrikethrough]} numberOfLines={2}>
          {task.title}
        </Text>
        <Text style={[s.taskStatusTxt, { color: STATUS_COLOR[task.status] }]}>
          {STATUS_LABEL[task.status]}
          {task.date !== today ? ` · ${task.date}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function StatusCircle({ status }: { status: Task['status'] }) {
  if (status === 'pending') {
    return <View style={s.circle} />;
  }
  if (status === 'doing') {
    return (
      <View style={[s.circle, s.circleDoing]}>
        <View style={s.centralPoint} />
      </View>
    );
  }
  return (
    <View style={[s.circle, s.circleCompleted]}>
      <Text style={s.checkmark}>✓</Text>
    </View>
  );
}

const s = StyleSheet.create({
  taskCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: ROUTINE_COLORS.surface, borderRadius: 14,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: ROUTINE_COLORS.border,
  },
  taskCardCompleted: { opacity: 0.45 },
  taskMiddle: { flex: 1, gap: 3 },
  taskTitle: { fontSize: 15, fontWeight: '500', color: ROUTINE_COLORS.textPrimary, lineHeight: 21 },
  taskTitleStrikethrough: { textDecorationLine: 'line-through', color: ROUTINE_COLORS.textMuted },
  taskStatusTxt: { fontSize: 12, fontWeight: '600' },
  circle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: ROUTINE_COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  circleDoing: { borderColor: ROUTINE_COLORS.statusDoing },
  centralPoint: { width: 9, height: 9, borderRadius: 5, backgroundColor: ROUTINE_COLORS.statusDoing },
  circleCompleted: { backgroundColor: ROUTINE_COLORS.statusDone, borderColor: ROUTINE_COLORS.statusDone },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 14 },
});
