import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius, Shadow, TAB_HEIGHT } from '@/constants/design';

import { FormModal } from '@/features/finance/components/form-modal';
import { InsightsRow } from '@/features/finance/components/insights-row';
import { ItemCard } from '@/features/finance/components/item-card';
import { PeriodFilter } from '@/features/finance/components/period-filter';
import { SummaryCard } from '@/features/finance/components/summary-card';
import { useFinance } from '@/features/finance/hooks/use-finance';

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
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.pageTitle}>Finanças</Text>
              <Text style={styles.pageSubtitle}>
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              </Text>
            </View>
          </View>
        </View>

        <SummaryCard summary={summary} />

        <PeriodFilter period={period} onPeriodChange={setPeriod} />

        <InsightsRow insights={insights} />

        {groupedItems.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="wallet.pass" size={32} color={Colors.bdr} />
            <Text style={styles.emptyStateText}>Nenhum registro neste período.</Text>
          </View>
        ) : (
          groupedItems.map((group) => (
            <View key={group.sortKey}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                <View style={styles.groupDivider} />
              </View>
              {group.items.map((item, i) => (
                <ItemCard
                  key={`${item.type}-${item.id ?? i}`}
                  item={item}
                  onLongPress={() => removeItem(item)}
                />
              ))}
            </View>
          ))
        )}

        <View style={{ height: TAB_HEIGHT + 80 }} />
      </ScrollView>

      <View style={styles.fabWrapper}>
        <TouchableOpacity style={styles.fabButton} activeOpacity={0.85} onPress={() => setIsModalOpen(true)}>
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={styles.fabText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FormModal
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSaving={isSaving}
        onSaveIncome={addIncome}
        onSaveExpense={addExpense}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

  headerWrapper: { backgroundColor: Colors.bg, paddingTop: 54, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontFamily: Fonts.display, fontSize: 30, color: Colors.t1, letterSpacing: -1, lineHeight: 33 },
  pageSubtitle: { fontFamily: Fonts.body, fontSize: 13, color: Colors.t3, marginTop: 2 },
  avatarWrapper: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.brandDim,
    borderWidth: 1, borderColor: 'rgba(124,111,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 8 },
  groupLabel: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1.2 },
  groupDivider: { flex: 1, height: 1, backgroundColor: Colors.bdr },

  emptyState: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyStateText: { fontFamily: Fonts.body, fontSize: 14, color: Colors.t3 },

  fabWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16 
  },
  
  fabButton: {
    gap: 8,
    paddingVertical: 16, 
    alignItems: 'center', 
    flexDirection: 'row',
    borderRadius: Radius.xs,
    justifyContent: 'center', 
    backgroundColor: Colors.brand, 
    ...Shadow.brand,
  },
  fabText: { fontFamily: Fonts.display, fontSize: 16, color: '#fff', letterSpacing: -0.2 },
});
