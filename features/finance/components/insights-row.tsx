import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius } from '@/constants/design';

interface InsightsRowProps {
  insights: string[];
}

export function InsightsRow({ insights }: InsightsRowProps) {
  if (insights.length === 0) return null;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrapper}>
        <IconSymbol name="lightbulb.fill" size={16} color={Colors.note} />
      </View>
      <Text style={styles.insightText}>{insights.join('  ·  ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: Colors.noteSurf,
    borderWidth: 1, borderColor: 'rgba(245,185,78,0.20)',
    borderRadius: Radius.md, padding: 12, paddingHorizontal: 14, marginBottom: 14,
  },
  iconWrapper: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(245,185,78,0.12)',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  insightText: { fontFamily: Fonts.body, fontSize: 12, color: Colors.t2, lineHeight: 18, flex: 1, marginTop: 7 },
});
