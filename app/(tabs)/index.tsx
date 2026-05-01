import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { CATEGORY_ICONS, CategoryIcon } from '../../features/finance/constants';
import { ListItem } from '../../features/finance/types';
import { formatCurrency } from '../../features/finance/utils/formatters';
import { Task } from '../../features/routine/types';
import { useHome } from '../../hooks/use-home';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia,';
  if (h < 18) return 'Boa tarde,';
  return 'Boa noite,';
}

export default function HomeScreen() {
  const [greeting, setGreeting] = useState(getGreeting());

  const { todayTasks, monthSummary, recentTransactions, streak, refresh } = useHome();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  const visibleTasks = todayTasks.slice(0, 3);
  const extraTasksCount = Math.max(0, todayTasks.length - 3);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.greetingName}>Jonathas</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')}>
              <Ionicons
                  name={"settings"}
                  size={24}
                  style={[{padding: 8}]}
                  color="#000"
              />
          </TouchableOpacity>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.streakBlock}>
            <View style={styles.streakInfo}>
              <IconSymbol name="flame.fill" size={24} color="#ffdd55" />
              <View style={styles.streakTextContainer}>
                <Text style={styles.streakValue}>{streak.currentStreak}</Text>
                <Text style={styles.streakLabel}>RECORDE ATUAL</Text>
              </View>
            </View>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakBlock}>
            <View style={styles.streakInfo}>
              <IconSymbol name="trophy.fill" size={20} color="#000" />
              <View style={styles.streakTextContainer}>
                <Text style={styles.streakValue}>{streak.bestStreak}</Text>
                <Text style={styles.streakLabel}>MELHOR RECORDE</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>TAREFAS DE HOJE</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.replace('/routine')}>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#555" />
              <Text style={styles.seeAllText}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {visibleTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhuma tarefa para hoje</Text>
            </View>
          ) : (
            <>
              {visibleTasks.map((task, i) => (
                <MiniTask
                  key={task.id ?? i}
                  task={task}
                  isLast={i === visibleTasks.length - 1 && extraTasksCount === 0}
                />
              ))}
              {extraTasksCount > 0 && (
                <TouchableOpacity onPress={() => router.replace('/routine')} style={styles.extraTasksRow}>
                  <Text style={styles.extraTasksText}>+{extraTasksCount} mais tarefa{extraTasksCount > 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={[styles.sectionCard, { marginBottom: 0 }]}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>ÚLTIMAS MOVIMENTAÇÕES</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.replace('/finance')}>
              <IconSymbol name="wallet.pass.fill" size={14} color="#555" />
              <Text style={styles.seeAllText}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Nenhuma movimentação registrada</Text>
            </View>
          ) : (
            recentTransactions.map((item, i) => (
              <MiniTransaction
                key={`${item.type}-${item.id ?? i}`}
                item={item}
                isLast={i === recentTransactions.length - 1}
              />
            ))
          )}
        </View>

        <View style={{ height: 148 }} />
      </ScrollView>
    </View>
  );
}

function MiniTask({ task, isLast }: { task: Task; isLast: boolean }) {
  const isDone = task.status === 'completed';
  const isDoing = task.status === 'doing';
  const borderColor = isDone ? '#2ada73' : isDoing ? '#ffdd55' : '#8a8a8a';
  const checkBackground = isDone ? '#2ada73' : isDoing ? 'rgba(245,185,78,0.12)' : 'transparent';

  return (
    <View style={[styles.taskItem, !isLast && styles.taskItemBorder]}>
      <View style={[styles.taskCheckbox, { backgroundColor: checkBackground, borderColor, borderWidth: isDone ? 0 : 1.5 }]}>
        {isDone && <IconSymbol name="checkmark" size={10} color="#fff" />}
        {isDoing && <View style={styles.taskCheckboxDot} />}
      </View>
      <Text style={[styles.taskText, isDone && styles.taskTextDone]} numberOfLines={1}>
        {task.title}
      </Text>
      {isDoing && <IconSymbol name="clock.fill" size={14} color="#ffdd55" />}
    </View>
  );
}

function MiniTransaction({ item, isLast }: { item: ListItem; isLast: boolean }) {
  const isIncome = item.type === 'income';
  const color = isIncome ? '#2ada73' : '#ff6e6e';
  const iconBackground = isIncome ? 'rgba(42,218,115,0.1)' : 'rgba(255,110,110,0.1)';
  const icon = (CATEGORY_ICONS[item.category] ?? 'dollarsign.circle.fill') as CategoryIcon;
  const dateLabel = isIncome ? item.date : item.purchase_date;

  return (
    <View style={[styles.transactionItem, !isLast && styles.transactionItemBorder]}>
      <View style={[styles.transactionIconContainer, { backgroundColor: iconBackground }]}>
        <IconSymbol name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.transactionName}>{item.category}</Text>
        <Text style={styles.transactionMeta}>{item.payment_type} · {dateLabel}</Text>
      </View>
      <Text style={[styles.transactionAmount, { color }]}>
        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 18,
  },
  headerLeft: {
  },
  greetingText: {
    fontSize: 15,
    color: '#8a8a8a',
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginTop: 2,
  },

  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  streakBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#7c7c7c',
    marginHorizontal: 8,
  },
  streakTextContainer: {
    gap: 8
  },
  streakValue: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#fafafa',
    lineHeight: 22,
  },

  streakLabel: {
    fontSize: 10,
    color: '#8a8a8a',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 18,
    marginBottom: 12,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionCardTitle: {
    fontSize: 10,
    color: '#8a8a8a',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#555555',
  },

  emptyState: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#8a8a8a',
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  taskItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskCheckbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheckboxDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffdd55',
  },
  taskText: {
    flex: 1,
    fontSize: 13,
    color: '#000000',
  },
  taskTextDone: {
    color: '#8a8a8a',
    textDecorationLine: 'line-through',
  },

  extraTasksRow: {
    paddingTop: 8,
  },
  extraTasksText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#555555',
  },

  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  transactionName: {
    fontWeight: '600',
    fontSize: 13,
    color: '#000000',
  },
  transactionMeta: {
    fontSize: 10,
    color: '#8a8a8a',
    marginTop: 1,
  },
  transactionAmount: {
    fontWeight: '700',
    fontSize: 13,
  },
});
