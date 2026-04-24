import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { shadowMd } from '@/constants/design';
import { FINANCE_COLORS } from '../constants';
import { FinanceSummary } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SummaryCardProps {
  summary: FinanceSummary;
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const isPositive = summary.balance >= 0;

  return (
    <View style={s.balanceCard}>
      <Text style={s.balanceLabel}>Period Balance</Text>
      <Text style={[s.balanceAmount, { color: isPositive ? '#E9D5FF' : '#FCA5A5' }]}>
        {formatCurrency(summary.balance)}
      </Text>
      <View style={s.balanceDetails}>
        <View style={s.balanceDetailItem}>
          <Text style={s.balanceDetailLabel}>↑ INCOME</Text>
          <Text style={[s.balanceDetailAmount, { color: FINANCE_COLORS.income }]}>
            {formatCurrency(summary.totalIncome)}
          </Text>
        </View>
        <View style={s.balanceDetailDiv} />
        <View style={s.balanceDetailItem}>
          <Text style={s.balanceDetailLabel}>↓ EXPENSES</Text>
          <Text style={[s.balanceDetailAmount, { color: FINANCE_COLORS.expense }]}>
            {formatCurrency(summary.totalExpenses)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  balanceCard: {
    backgroundColor: FINANCE_COLORS.accent,
    borderRadius: 20,
    padding: 20,
    marginTop: 6,
    marginBottom: 16,
    ...shadowMd,
    shadowColor: FINANCE_COLORS.accentDark,
  },
  balanceLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  balanceAmount: { fontSize: 38, fontWeight: '800', letterSpacing: -1.5, marginTop: 2 },
  balanceDetails: { flexDirection: 'row', marginTop: 16, alignItems: 'center' },
  balanceDetailItem: { flex: 1 },
  balanceDetailDiv: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 16 },
  balanceDetailLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '500', letterSpacing: 0.3 },
  balanceDetailAmount: { fontSize: 16, fontWeight: '700', marginTop: 3 },
});
