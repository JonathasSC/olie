import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius } from '@/constants/design';
import { FinanceSummary } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardProps {
  summary: FinanceSummary;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const { balance, totalIncomes, totalExpenses } = summary;
  const savingsRate = totalIncomes > 0 ? Math.round(((totalIncomes - totalExpenses) / totalIncomes) * 100) : 0;

  return (
    <View style={s.card}>
      <View style={s.glow} />
      <Text style={s.lbl}>Saldo atual</Text>
      <Text style={s.amount}>{formatCurrency(balance)}</Text>
      <View style={s.statsRow}>
        <View style={s.statBlock}>
          <Text style={[s.statVal, { color: Colors.income }]}>{formatCurrency(totalIncomes)}</Text>
          <View style={s.statLbl}>
            <IconSymbol name="arrow.up" size={12} color={Colors.income} />
            <Text style={s.statLblTxt}>Receitas</Text>
          </View>
        </View>
        <View style={s.statBlock}>
          <Text style={[s.statVal, { color: Colors.expense }]}>{formatCurrency(totalExpenses)}</Text>
          <View style={s.statLbl}>
            <IconSymbol name="arrow.down" size={12} color={Colors.expense} />
            <Text style={s.statLblTxt}>Despesas</Text>
          </View>
        </View>
        <View style={s.statBlock}>
          <Text style={[s.statVal, { color: Colors.brandLt }]}>{savingsRate}%</Text>
          <View style={s.statLbl}>
            <IconSymbol name="banknote.fill" size={12} color={Colors.brandLt} />
            <Text style={s.statLblTxt}>Poupança</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 22,
    borderWidth: 1, borderColor: 'rgba(124,111,255,0.22)',
    marginBottom: 14,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute', top: -60, right: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(124,111,255,0.10)',
  },
  lbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  amount: { fontFamily: Fonts.display, fontSize: 40, color: Colors.t1, letterSpacing: -2, lineHeight: 44, marginBottom: 18 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBlock: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.sm, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  statVal: { fontFamily: Fonts.heading, fontSize: 14 },
  statLbl: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  statLblTxt: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 0.8 },
});
