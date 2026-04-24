import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FINANCE_COLORS, CATEGORY_ICONS, CategoryIcon } from '../constants';
import { Income, Expense, ListItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ItemCardProps {
  item: ListItem;
  onLongPress: () => void;
}

export function ItemCard({ item, onLongPress }: ItemCardProps) {
  const isIncome = item.nature === 'income';
  const color = isIncome ? FINANCE_COLORS.income : FINANCE_COLORS.expense;
  const colorSurface = isIncome ? FINANCE_COLORS.incomeSurface : FINANCE_COLORS.expenseSurface;
  const icon = (CATEGORY_ICONS[item.category] ?? 'dollarsign.circle.fill') as CategoryIcon;
  const expense = item as Expense;

  return (
    <TouchableOpacity style={s.card} onLongPress={onLongPress} activeOpacity={0.7}>
      <View style={[s.cardIconWrap, { backgroundColor: colorSurface }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <View style={s.cardMiddle}>
        <Text style={s.cardCategory}>{item.category}</Text>
        <Text style={s.cardSub}>
          {item.payment_type}
          {!isIncome && expense.installments > 1 ? ` · ${expense.installments}x` : ''}
          {' · '}
          {isIncome ? (item as Income).date : expense.purchase_date}
        </Text>
      </View>
      <View style={s.cardRight}>
        <Text style={[s.cardAmount, { color: color }]}>
          {isIncome ? '+' : '−'} {formatCurrency(item.amount)}
        </Text>
        {!isIncome && expense.installments > 1 && (
          <Text style={s.cardInstallment}>1/{expense.installments}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: FINANCE_COLORS.surface,
    borderRadius: 14,
    padding: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: FINANCE_COLORS.border,
  },
  cardIconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardMiddle: { flex: 1, gap: 3 },
  cardCategory: { fontSize: 14, fontWeight: '600', color: FINANCE_COLORS.textPrimary },
  cardSub: { fontSize: 12, color: FINANCE_COLORS.textMuted },
  cardRight: { alignItems: 'flex-end', gap: 3 },
  cardAmount: { fontSize: 15, fontWeight: '700' },
  cardInstallment: { fontSize: 11, color: FINANCE_COLORS.textMuted },
});
