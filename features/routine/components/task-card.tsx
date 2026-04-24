import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius } from '@/constants/design';
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
  const { status } = task;
  const isDone = status === 'completed';
  const isDoing = status === 'doing';

  return (
    <TouchableOpacity
      style={[
        s.card,
        isDoing && s.cardDoing,
        isDone && s.cardDone,
      ]}
      onPress={onEdit}
      activeOpacity={0.75}
    >
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onCycleStatus();
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <StatusCircle status={status} />
      </TouchableOpacity>

      <View style={s.body}>
        <Text style={[s.title, isDone && s.titleDone]} numberOfLines={2}>
          {task.title}
        </Text>
        <View style={s.metaRow}>
          <View style={[s.pill, { backgroundColor: pillBg(status), borderColor: pillBorder(status) }]}>
            <Text style={[s.pillTxt, { color: STATUS_COLOR[status] }]}>
              {STATUS_LABEL[status]}
            </Text>
          </View>
          <Text style={s.dateTxt}>
            {task.date !== today ? task.date : ''}
          </Text>
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.actionBtn} onPress={onEdit}>
          <IconSymbol name="pencil" size={16} color={Colors.t3} />
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn} onPress={onDelete}>
          <IconSymbol name="trash" size={16} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function pillBg(status: Task['status']) {
  if (status === 'completed') return 'rgba(78,203,163,0.10)';
  if (status === 'doing') return 'rgba(245,185,78,0.10)';
  return 'rgba(70,72,112,0.30)';
}
function pillBorder(status: Task['status']) {
  if (status === 'completed') return 'rgba(78,203,163,0.30)';
  if (status === 'doing') return 'rgba(245,185,78,0.30)';
  return Colors.bdr;
}

function StatusCircle({ status }: { status: Task['status'] }) {
  const isDone = status === 'completed';
  const isDoing = status === 'doing';

  const bg = isDone ? Colors.income : isDoing ? 'rgba(245,185,78,0.12)' : 'transparent';
  const border = isDone ? Colors.income : isDoing ? Colors.note : Colors.t3;

  return (
    <View style={[s.circle, { backgroundColor: bg, borderColor: border }]}>
      {isDone && <IconSymbol name="checkmark" size={11} color="#fff" />}
      {isDoing && <View style={s.doingDot} />}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: 13, paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1, borderColor: Colors.bdr,
  },
  cardDoing: { borderColor: 'rgba(245,185,78,0.25)' },
  cardDone: { opacity: 0.7 },
  circle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  doingDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.note },
  body: { flex: 1, gap: 5 },
  title: { fontFamily: Fonts.bodySb, fontSize: 14, color: Colors.t1, lineHeight: 19 },
  titleDone: { color: Colors.t3, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pill: {
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  pillTxt: { fontFamily: Fonts.bodyBd, fontSize: 10, letterSpacing: 0.2 },
  dateTxt: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionBtn: { padding: 4, borderRadius: 8 },
});
