import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import ScreenHeader from '../../components/screen-header';
import { FinanceRepository } from '../../features/finance/services/finance-repository';
import { ListItem } from '../../features/finance/types';
import { formatCurrency } from '../../features/finance/utils/formatters';
import FinanceButtonsSection from '../../sections/finance-buttons';
import FinanceHistorySection from '../../sections/finance-history';

interface CategoryTotal {
    category: string;
    total: number;
}

function computeTop3(expenses: { category: string; amount: number }[]): CategoryTotal[] {
    const map = new Map<string, number>();
    for (const e of expenses) {
        map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return [...map.entries()]
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);
}

const RANK_COLORS = ['#ff6e6e', '#ffb347', '#ffdd55'];

export default function FinanceScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const [top3, setTop3] = useState<CategoryTotal[]>([]);
    const [items, setItems] = useState<ListItem[]>([]);

    useFocusEffect(useCallback(() => {
        const all = FinanceRepository.listAll();
        setItems(all);
        setTop3(computeTop3(all.filter((i) => i.type === 'expense')));
    }, []));

    const maxTotal = top3[0]?.total ?? 1;

    return (
        <View style={styles.screen}>
            <ScreenHeader title="Finanças" />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.balanceContainer}>
                    <View>
                        <Text style={styles.balanceLabel}>Saldo</Text>
                        {isVisible ? (
                            <Text style={styles.balanceValue}>R$ 12.000,00</Text>
                        ) : (
                            <View style={styles.skeletonValue} />
                        )}
                    </View>

                    <TouchableOpacity onPress={() => setIsVisible(!isVisible)}>
                        <Ionicons
                            name={isVisible ? "eye-outline" : "eye-off-outline"}
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

                <FinanceHistorySection items={items} />
            </ScrollView>
        </View>
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
        gap: 4,
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingVertical: 16,
    },
    balanceLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8a8a8a',
    },
    balanceValue: {
        fontSize: 20,
        fontWeight: '700',
    },
    skeletonValue: {
        width: 150,
        height: 22.5,
        backgroundColor: '#e0e0e0',
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
    empty: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 13,
        color: '#8a8a8a',
    },
});
