import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, Radius } from '@/constants/design';
import { Period } from '../types';

interface PeriodFilterProps {
  period: Period;
  onPeriodChange: (newPeriod: Period) => void;
}

export function PeriodFilter({ period, onPeriodChange }: PeriodFilterProps) {
  const options: { key: Period; label: string }[] = [
    { key: 'today',  label: 'Hoje' },
    { key: 'week',   label: 'Semana' },
    { key: 'month',  label: 'Mês' },
  ];

  return (
    <View style={styles.filterRow}>
      {options.map(({ key, label }) => {
        const isActive = period === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.filterButton, isActive && styles.filterButtonActive]}
            onPress={() => onPeriodChange(key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  filterButton: {
    flex: 1, paddingVertical: 8, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.bdr,
    backgroundColor: 'transparent', alignItems: 'center',
  },
  filterButtonActive: { backgroundColor: Colors.brandDim, borderColor: 'rgba(124,111,255,0.4)' },
  filterButtonText: { fontFamily: Fonts.bodyBd, fontSize: 12, color: Colors.t3 },
  filterButtonTextActive: { color: Colors.brandLt },
});
