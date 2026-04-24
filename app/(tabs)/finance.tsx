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

import { useFinance } from '@/features/finance/hooks/use-finance';
import { FINANCE_COLORS } from '@/features/finance/constants';
import { SummaryCard } from '@/features/finance/components/summary-card';
import { PeriodFilter } from '@/features/finance/components/period-filter';
import { InsightsRow } from '@/features/finance/components/insights-row';
import { ItemCard } from '@/features/finance/components/item-card';
import { FormModal } from '@/features/finance/components/form-modal';

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
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        {/* Sticky header */}
        <View style={s.headerWrap}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.pageTitle}>Finanças</Text>
              <Text style={s.pageSub}>
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
              </Text>
            </View>
            <View style={s.avatarWrap}>
              <IconSymbol name="person.fill" size={18} color={Colors.brandLt} />
            </View>
          </View>
        </View>

        <SummaryCard summary={summary} />

        <PeriodFilter period={period} onPeriodChange={setPeriod} />

        <InsightsRow insights={insights} />

        {groupedItems.length === 0 ? (
          <View style={s.empty}>
            <IconSymbol name="wallet.pass" size={32} color={Colors.bdr} />
            <Text style={s.emptyTxt}>Nenhum registro neste período.</Text>
          </View>
        ) : (
          groupedItems.map((group) => (
            <View key={group.sortKey}>
              <View style={s.grpHdr}>
                <Text style={s.grpLbl}>{group.label}</Text>
                <View style={s.grpLine} />
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

      {/* FAB */}
      <View style={s.fabWrap}>
        <TouchableOpacity style={s.fabBtn} activeOpacity={0.85} onPress={() => setIsModalOpen(true)}>
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={s.fabTxt}>Adicionar</Text>
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

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },

  headerWrap: { backgroundColor: Colors.bg, paddingTop: 54, paddingBottom: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { fontFamily: Fonts.display, fontSize: 30, color: Colors.t1, letterSpacing: -1, lineHeight: 33 },
  pageSub: { fontFamily: Fonts.body, fontSize: 13, color: Colors.t3, marginTop: 2 },
  avatarWrap: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.brandDim,
    borderWidth: 1, borderColor: 'rgba(124,111,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },

  grpHdr: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 8 },
  grpLbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1.2 },
  grpLine: { flex: 1, height: 1, backgroundColor: Colors.bdr },

  empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyTxt: { fontFamily: Fonts.body, fontSize: 14, color: Colors.t3 },

  fabWrap: { position: 'absolute', bottom: TAB_HEIGHT + 14, left: 16, right: 16 },
  fabBtn: {
    backgroundColor: Colors.brand, borderRadius: Radius.md,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    ...Shadow.brand,
  },
  fabTxt: { fontFamily: Fonts.display, fontSize: 16, color: '#fff', letterSpacing: -0.2 },
});
