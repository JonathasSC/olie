import { Redirect, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FinanceRepository } from '@/features/finance/services/finance-repository';
import { FinanceService } from '@/features/finance/services/finance-service';
import { ProfileRepository } from '@/services/db/profile-repository';
import { Ionicons } from '@expo/vector-icons';
import { SpendingBarChart } from '../../components/spending-bar-chart';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { FinanceSummary } from '../../features/finance/types';
import { formatCurrency } from '../../features/finance/utils/formatters';
import { Task } from '../../features/routine/types';
import { useHome } from '../../hooks/use-home';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia,';
  if (h < 18) return 'Boa tarde,';
  return 'Boa noite,';
}

function msUntilNextGreetingChange(): number {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const remaining = (60 - m) * 60 * 1000 - s * 1000;
  if (h < 12)  return (12 - h - 1) * 3600 * 1000 + remaining;
  if (h < 18)  return (18 - h - 1) * 3600 * 1000 + remaining;
  return       (24 - h - 1) * 3600 * 1000 + remaining;
}

const EMPTY_SUMMARY: FinanceSummary = { totalIncomes: 0, totalExpenses: 0, totalInvestments: 0, balance: 0 };

export default function HomeScreen() {
  const profile = ProfileRepository.get();
  if (!profile.firstName.trim()) return <Redirect href="/onboarding" />;

  const [greeting, setGreeting] = useState(getGreeting());

  const { todayTasks, weeklyExpenses, streak, refresh } = useHome();
  const [summary, setSummary] = useState<FinanceSummary>(EMPTY_SUMMARY);
  const [firstName, setFirstName] = useState(() => profile.firstName);

  useFocusEffect(useCallback(() => {
      const all = FinanceRepository.listAll();
      setSummary(FinanceService.calculateSummary(all));
      setFirstName(ProfileRepository.get().firstName);
  }, []));

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    function schedule() {
      id = setTimeout(() => { setGreeting(getGreeting()); schedule(); }, msUntilNextGreetingChange());
    }
    schedule();
    return () => clearTimeout(id);
  }, []);

  const visibleTasks = useMemo(() => todayTasks.slice(0, 3), [todayTasks]);
  const extraTasksCount = useMemo(() => Math.max(0, todayTasks.length - 3), [todayTasks]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')}>
              <Ionicons
                  name={"settings-outline"}
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
          <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Ganhos</Text>
                  <Text style={[styles.breakdownValue, styles.breakdownIncome]}>
                      {formatCurrency(summary.totalIncomes)}
                  </Text>
              </View>
              <View style={styles.breakdownSep} />
              <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Gastos</Text>
                  <Text style={[styles.breakdownValue, styles.breakdownExpense]}>
                      {formatCurrency(summary.totalExpenses)}
                  </Text>
              </View>
              <View style={styles.breakdownSep} />
              <View style={styles.breakdownItem}>
                  <Text style={styles.breakdownLabel}>Investido</Text>
                  <Text style={[styles.breakdownValue, styles.breakdownInvest]}>
                      {formatCurrency(summary.totalInvestments)}
                  </Text>
              </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>TAREFAS DE HOJE</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.navigate('/routine')}>
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
                <TouchableOpacity onPress={() => router.navigate('/routine')} style={styles.extraTasksRow}>
                  <Text style={styles.extraTasksText}>+{extraTasksCount} mais tarefa{extraTasksCount > 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Text style={styles.sectionCardTitle}>AVANÇO DE GASTOS</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.navigate('/finance')}>
              <IconSymbol name="chart.bar.fill" size={14} color="#555" />
              <Text style={styles.seeAllText}>Detalhes</Text>
            </TouchableOpacity>
          </View>
          <SpendingBarChart data={weeklyExpenses} />
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
    borderColor: '#dddddd',
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
    width: 8,
    height: 8,
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

  breakdownRow: {
        flexDirection: 'row',
        borderRadius: 10,
        marginBottom: 4,
    },
    breakdownItem: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        gap: 2,
    },
    breakdownSep: {
        width: 1,
        backgroundColor: '#f0f0f0',
    },
    breakdownLabel: {
        fontSize: 10,
        color: '#aaa',
        fontWeight: '500',
    },
    breakdownValue: {
        fontSize: 12,
        fontWeight: '700',
    },
    breakdownIncome: {
        color: '#2ECC71',
    },
    breakdownExpense: {
        color: '#ff6e6e',
    },
    breakdownInvest: {
        color: '#3498DB',
    },
});
