import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FINANCE_COLORS } from '../constants';

interface InsightsRowProps {
  insights: string[];
}

export function InsightsRow({ insights }: InsightsRowProps) {
  if (insights.length === 0) return null;

  return (
    <View style={s.insightsRow}>
      <IconSymbol name="lightbulb.fill" size={14} color={FINANCE_COLORS.warning} />
      <Text style={s.insightsText}>{insights.join('  ·  ')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  insightsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FINANCE_COLORS.warningSurface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  insightsText: { fontSize: 12, color: FINANCE_COLORS.warning, flex: 1, fontWeight: '500' },
});
