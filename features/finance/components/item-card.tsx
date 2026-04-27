import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius } from '@/constants/design';
import { CATEGORY_ICONS, CategoryIcon } from '../constants';
import { Income, Expense, ListItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ItemCardProps {
  item: ListItem;
  onLongPress: () => void;
}

export function ItemCard({ item, onLongPress }: ItemCardProps) {
  const isIncome = item.type === 'income';
  const color = isIncome ? Colors.income : Colors.expense;
  const colorSurf = isIncome ? Colors.incomeSurf : Colors.expenseSurf;
  const icon = (CATEGORY_ICONS[item.category] ?? 'dollarsign.circle.fill') as CategoryIcon;

  const dateLabel = isIncome
    ? (item as Income & { type: 'income' }).date
    : (item as Expense & { type: 'expense' }).purchase_date;

  const installments = !isIncome
    ? (item as Expense & { type: 'expense' }).installments
    : 1;

  return (
    <TouchableOpacity style={styles.card} onLongPress={onLongPress} activeOpacity={0.75}>
      <View style={[styles.categoryIconWrapper, { backgroundColor: colorSurf }]}>
        <IconSymbol name={icon} size={18} color={color} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.meta}>
          {item.payment_type}
          {!isIncome && installments > 1 ? ` · ${installments}x` : ''}
          {' · '}
          {dateLabel}
        </Text>
      </View>
      <View style={styles.amountSection}>
        <Text style={[styles.amount, { color }]}>
          {isIncome ? '+' : '−'}{formatCurrency(item.amount)}
        </Text>
        {!isIncome && installments > 1 && (
          <Text style={styles.installment}>1/{installments}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md, padding: 13, paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1, borderColor: Colors.bdr,
  },
  categoryIconWrapper: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemInfo: { flex: 1, gap: 2 },
  category: { fontFamily: Fonts.bodySb, fontSize: 14, color: Colors.t1 },
  meta: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.t3 },
  amountSection: { alignItems: 'flex-end', gap: 2 },
  amount: { fontFamily: Fonts.heading, fontSize: 15 },
  installment: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.t3 },
});
