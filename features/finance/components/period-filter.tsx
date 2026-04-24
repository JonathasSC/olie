import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FINANCE_COLORS } from '../constants';
import { Period } from '../types';

interface PeriodFilterProps {
  period: Period;
  onPeriodChange: (p: Period) => void;
}

export function PeriodFilter({ period, onPeriodChange }: PeriodFilterProps) {
  const options: Period[] = ['hoje', 'semana', 'mes'];
  const labels: Record<Period, string> = {
    hoje: 'Today',
    semana: 'Week',
    mes: 'Month',
  };

  return (
    <View style={s.filterRow}>
      {options.map((p) => (
        <TouchableOpacity
          key={p}
          style={[s.filterButton, period === p && s.filterButtonActive]}
          onPress={() => onPeriodChange(p)}
        >
          <Text style={[s.filterText, period === p && s.filterTextActive]}>
            {labels[p]}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterButton: {
    flex: 1, paddingVertical: 9, borderRadius: 22,
    backgroundColor: FINANCE_COLORS.surface, alignItems: 'center',
    borderWidth: 1.5, borderColor: FINANCE_COLORS.border,
  },
  filterButtonActive: { backgroundColor: FINANCE_COLORS.accent, borderColor: FINANCE_COLORS.accent },
  filterText: { fontSize: 13, fontWeight: '600', color: FINANCE_COLORS.textSecondary },
  filterTextActive: { color: '#fff' },
});
