import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedView } from '@/components/themed-view';
import { shadowMd } from '@/constants/design';

import { useFinance } from '@/features/finance/hooks/use-finance';
import { FINANCE_COLORS } from '@/features/finance/constants';
import { SummaryCard } from '@/features/finance/components/summary-card';
import { PeriodFilter } from '@/features/finance/components/period-filter';
import { InsightsRow } from '@/features/finance/components/insights-row';
import { ItemCard } from '@/features/finance/components/item-card';
import { FormModal } from '@/features/finance/components/form-modal';
import { PressableScale } from '@/components/ui/pressable-scale';

export default function FinanceScreen() {
  const {
    summary,
    period,
    setPeriod,
    insights,
    groupedItems,
    isSaving,
    addIncome,
    addExpense,
    removeItem,
  } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ThemedView style={s.screen} lightColor={FINANCE_COLORS.bg} darkColor={FINANCE_COLORS.bg}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={s.headerWrap}>
          <Text style={s.pageTitle}>Finance Tracker</Text>
        </View>

        <SummaryCard summary={summary} />

        <PeriodFilter period={period} onPeriodChange={setPeriod} />

        <InsightsRow insights={insights} />

        {groupedItems.length === 0 ? (
          <Text style={s.empty}>No records in this period.</Text>
        ) : (
          groupedItems.map((group) => (
            <View key={group.sortKey}>
              <View style={s.groupHeader}>
                <Text style={s.groupLabel}>{group.label}</Text>
                <View style={s.groupLine} />
              </View>
              {group.itens.map((item, i) => (
                <ItemCard
                  key={`${item.nature}-${item.id ?? i}`}
                  item={item}
                  onLongPress={() => removeItem(item)}
                />
              ))}
            </View>
          ))
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      <View style={s.btnWrap}>
        <PressableScale 
          style={s.btnRegister} 
          onPress={() => setIsModalOpen(true)} 
        >
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={s.btnRegisterText}>Add</Text>
        </PressableScale>
      </View>

      <FormModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSaving={isSaving}
        onSaveIncome={addIncome}
        onSaveExpense={addExpense}
      />
    </ThemedView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: FINANCE_COLORS.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  headerWrap: { backgroundColor: FINANCE_COLORS.bg, paddingTop: 56, paddingBottom: 8 },
  pageTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: FINANCE_COLORS.textPrimary },
  empty: { textAlign: 'center', marginTop: 48, color: FINANCE_COLORS.textMuted, fontSize: 14 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, marginTop: 6 },
  groupLabel: { fontSize: 11, fontWeight: '700', color: FINANCE_COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  groupLine: { flex: 1, height: 1, backgroundColor: FINANCE_COLORS.borderLight },
  btnWrap: { position: 'absolute', bottom: 24, left: 16, right: 16 },
  btnRegister: {
    backgroundColor: FINANCE_COLORS.accent, borderRadius: 16,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    ...shadowMd, shadowColor: FINANCE_COLORS.accentDark,
  },
  btnRegisterText: { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.2 },
});
