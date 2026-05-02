import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ScreenHeader from '../../components/screen-header';
import { INVESTMENT_CATEGORIES } from '../../features/finance/constants/finance-form-config';
import { FinanceRepository } from '../../features/finance/services/finance-repository';
import { FinanceService } from '../../features/finance/services/finance-service';
import { FinanceGroup, FinanceSummary, ListItem } from '../../features/finance/types';
import { formatCurrency } from '../../features/finance/utils/formatters';
import FinanceButtonsSection from '../../sections/finance-buttons';

const INVESTMENT_SET = new Set<string>(INVESTMENT_CATEGORIES);

type CategoryTotal = { category: string; total: number };

const RANK_COLORS = ['#ff6e6e', '#ffb347', '#ffdd55'];
const EMPTY_SUMMARY: FinanceSummary = { totalIncomes: 0, totalExpenses: 0, totalInvestments: 0, balance: 0 };

export default function FinanceScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [top3, setTop3] = useState<CategoryTotal[]>([]);
    const [groups, setGroups] = useState<FinanceGroup[]>([]);
    const [summary, setSummary] = useState<FinanceSummary>(EMPTY_SUMMARY);

    useFocusEffect(useCallback(() => {
        const all = FinanceRepository.listAll();
        setSummary(FinanceService.calculateSummary(all));
        setTop3(FinanceService.computeTop3(all.filter((i) => i.type === 'expense')));
        setGroups(FinanceService.groupByDate(all));
    }, []));

    const maxTotal = useMemo(() => top3[0]?.total ?? 1, [top3]);
    const hasTransactions = groups.length > 0;

    return (
        <View style={styles.screen}>
            <ScreenHeader title="Finanças" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.balanceContainer}>
                    <View style={styles.balanceMain}>
                        <Text style={styles.balanceLabel}>Saldo disponível</Text>
                        {isVisible ? (
                            <Text style={[styles.balanceValue, summary.balance < 0 && styles.balanceNegative]}>
                                {formatCurrency(summary.balance)}
                            </Text>
                        ) : (
                            <View style={styles.skeletonValue} />
                        )}
                    </View>

                    <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
                        <Ionicons
                            name={isVisible ? 'eye-outline' : 'eye-off-outline'}
                            size={24}
                            style={{ padding: 8 }}
                            color="#000"
                        />
                    </TouchableOpacity>
                </View>

                <FinanceButtonsSection />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Top categorias</Text>
                    {top3.length === 0 ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>Nada para mostrar</Text>
                        </View>
                    ) : (
                        <View style={styles.card}>
                            {top3.map((item, i) => (
                                <View
                                    key={item.category}
                                    style={[styles.topItem, i < top3.length - 1 && styles.topItemBorder]}
                                >
                                    <View style={styles.topItemRow}>
                                        <View style={styles.topItemLeft}>
                                            <View style={[styles.rankDot, { backgroundColor: RANK_COLORS[i] }]} />
                                            <Text style={styles.topItemCategory}>{item.category}</Text>
                                        </View>
                                        <Text style={styles.topItemAmount}>{formatCurrency(item.total)}</Text>
                                    </View>
                                    <View style={styles.barTrack}>
                                        <View
                                            style={[
                                                styles.barFill,
                                                {
                                                    width: `${(item.total / maxTotal) * 100}%` as any,
                                                    backgroundColor: RANK_COLORS[i],
                                                },
                                            ]}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Movimentações</Text>
                    {!hasTransactions ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyText}>Nenhuma movimentação registrada</Text>
                        </View>
                    ) : (
                        groups.map((group) => (
                            <View key={group.sortKey} style={styles.group}>
                                <Text style={styles.groupLabel}>{group.label}</Text>
                                <View style={styles.card}>
                                    {group.items.map((item, i) => (
                                        <TransactionRow
                                            key={`${item.type}-${item.id ?? i}`}
                                            item={item}
                                            isLast={i === group.items.length - 1}
                                        />
                                    ))}
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

function TransactionRow({ item, isLast }: { item: ListItem; isLast: boolean }) {
    const isExpense = item.type === 'expense';
    const isInvestment = !isExpense && INVESTMENT_SET.has(item.category);
    const color = isExpense ? '#ff6e6e' : isInvestment ? '#3498DB' : '#2ada73';
    const prefix = isExpense ? '-' : '+';
    const dateLabel = item.type === 'income' ? item.date : item.purchase_date;

    function handlePress() {
        if (!item.id) return;
        const formType = isExpense ? 'expense' : isInvestment ? 'investment' : 'income';
        router.push(`/finance-editor?type=${formType}&id=${item.id}`);
    }

    return (
        <Pressable
            style={({ pressed }) => [styles.txRow, !isLast && styles.txRowBorder, pressed && styles.txRowPressed]}
            onPress={handlePress}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.txCategory}>{item.category}</Text>
                <Text style={styles.txMeta}>{item.payment_type} · {dateLabel}</Text>
            </View>
            <View style={styles.txRight}>
                <Text style={[styles.txAmount, { color }]}>
                    {prefix}{formatCurrency(item.amount)}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#ccc" />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    balanceContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingTop: 16,
        paddingBottom: 8,
    },
    balanceMain: {
        gap: 4,
        marginBottom: 16,
    },
    balanceLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: '#8a8a8a',
    },
    balanceValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
    },
    balanceNegative: {
        color: '#ff4f4f',
    },
    skeletonValue: {
        width: 150,
        height: 28,
        backgroundColor: '#e0e0e0',
        borderRadius: 6,
        marginTop: 4,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        paddingBottom: 16,
    },
    card: {
        borderWidth: 1,
        borderColor: '#f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    topItem: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 10,
    },
    topItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    topItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rankDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    topItemCategory: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    topItemAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000',
    },
    barTrack: {
        height: 4,
        backgroundColor: '#f0f0f0',
        borderRadius: 2,
        overflow: 'hidden',
    },
    barFill: {
        height: 4,
        borderRadius: 2,
    },
    group: {
        marginBottom: 16,
    },
    groupLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8a8a8a',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    txRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    txRowPressed: {
        backgroundColor: '#f9f9f9',
    },
    txIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    txCategory: {
        fontWeight: '600',
        fontSize: 13,
        color: '#000',
    },
    txMeta: {
        fontSize: 10,
        color: '#8a8a8a',
        marginTop: 1,
    },
    txRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    txAmount: {
        fontWeight: '700',
        fontSize: 13,
    },
    empty: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        color: '#8a8a8a',
    },
});
