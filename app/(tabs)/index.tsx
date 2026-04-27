import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius, TAB_HEIGHT } from '@/constants/design';
import { CATEGORY_ICONS, CategoryIcon } from '@/features/finance/constants';
import { ListItem } from '@/features/finance/types';
import { formatCurrency } from '@/features/finance/utils/formatters';
import { STATUS_COLOR } from '@/features/routine/constants';
import { Task } from '@/features/routine/types';
import { useHome } from '@/hooks/use-home';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia,';
  if (h < 18) return 'Boa tarde,';
  return 'Boa noite,';
}

function getWeekDays() {
  const today = new Date();
  const dayLetters = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const days = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({ letter: dayLetters[d.getDay()], num: d.getDate(), isToday: i === 0 });
  }
  return days;
}

export default function InicioScreen() {
  const [greeting, setGreeting] = useState(getGreeting());
  const weekDays = getWeekDays();

  const { todayTasks, monthSummary, recentTransactions, streak, refresh } = useHome();
  const { balance, totalIncomes, totalExpenses } = monthSummary;
  const savingsRate = totalIncomes > 0
    ? Math.round(((totalIncomes - totalExpenses) / totalIncomes) * 100)
    : 0;

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  const visibleTasks = todayTasks.slice(0, 3);
  const extraTasksCount = Math.max(0, todayTasks.length - 3);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.greetingName}>Jonathas</Text>
        </View>

        <View style={styles.weekStrip}>
          {weekDays.map((d, i) => (
            <View key={i} style={[styles.weekDay, d.isToday && styles.weekDayToday]}>
              <Text style={[styles.weekDayLetter, d.isToday && styles.weekDayLetterToday]}>{d.letter}</Text>
              <Text style={[styles.weekDayNum, d.isToday && styles.weekDayNumToday]}>{d.num}</Text>
              <View style={[styles.weekDot, { backgroundColor: d.isToday ? Colors.brand : 'transparent' }]} />
            </View>
          ))}
        </View>

        <View style={styles.streakCard}>
          <View style={styles.streakBlock}>
            <View style={styles.streakInfo}>
              <IconSymbol name="flame.fill" size={24} color={Colors.note} />
              <View>
                <Text style={styles.streakValue}>{streak.currentStreak}</Text>
                <Text style={styles.streakLabel}>RECORDE ATUAL</Text>
              </View>
            </View>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakBlock}>
            <View style={styles.streakInfo}>
              <IconSymbol name="trophy.fill" size={20} color={Colors.brand} />
              <View>
                <Text style={styles.streakValue}>{streak.bestStreak}</Text>
                <Text style={styles.streakLabel}>MELHOR RECORDE</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceCardGlow} />
          <Text style={styles.balanceLbl}>Saldo do mês</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statVal, { color: Colors.income }]}>{formatCurrency(totalIncomes)}</Text>
              <View style={styles.statLbl}>
                <IconSymbol name="arrow.up" size={12} color={Colors.income} />
                <Text style={styles.statLblTxt}>Receitas</Text>
              </View>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statVal, { color: Colors.expense }]}>{formatCurrency(totalExpenses)}</Text>
              <View style={styles.statLbl}>
                <IconSymbol name="arrow.down" size={12} color={Colors.expense} />
                <Text style={styles.statLblTxt}>Despesas</Text>
              </View>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statVal, { color: Colors.brandLt }]}>{savingsRate}%</Text>
              <View style={styles.statLbl}>
                <IconSymbol name="banknote.fill" size={12} color={Colors.brandLt} />
                <Text style={styles.statLblTxt}>Poupança</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.homeCard}>
          <View style={styles.homeCardHdr}>
            <Text style={styles.homeCardTitle}>TAREFAS DE HOJE</Text>
            <TouchableOpacity style={styles.secAction} onPress={() => router.replace('/routine')}>
              <IconSymbol name="checkmark.circle.fill" size={14} color={Colors.brandLt} />
              <Text style={styles.secActionTxt}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {visibleTasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardTxt}>Nenhuma tarefa para hoje</Text>
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
                <TouchableOpacity onPress={() => router.replace('/routine')} style={styles.extraRow}>
                  <Text style={styles.extraTxt}>+{extraTasksCount} mais tarefa{extraTasksCount > 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={[styles.homeCard, { marginBottom: 0 }]}>
          <View style={styles.homeCardHdr}>
            <Text style={styles.homeCardTitle}>ÚLTIMAS MOVIMENTAÇÕES</Text>
            <TouchableOpacity style={styles.secAction} onPress={() => router.replace('/finance')}>
              <IconSymbol name="wallet.pass.fill" size={14} color={Colors.brandLt} />
              <Text style={styles.secActionTxt}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardTxt}>Nenhuma movimentação registrada</Text>
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

        <View style={{ height: TAB_HEIGHT + 80 }} />
      </ScrollView>
    </View>
  );
}

function MiniTask({ task, isLast }: { task: Task; isLast: boolean }) {
  const isDone = task.status === 'completed';
  const isDoing = task.status === 'doing';
  const borderColor = STATUS_COLOR[task.status];
  const checkBg = isDone ? Colors.income : isDoing ? 'rgba(245,185,78,0.12)' : 'transparent';

  return (
    <View style={[styles.miniTask, !isLast && styles.miniTaskBorder]}>
      <View style={[styles.miniCheck, { backgroundColor: checkBg, borderColor, borderWidth: isDone ? 0 : 1.5 }]}>
        {isDone && <IconSymbol name="checkmark" size={10} color="#fff" />}
        {isDoing && <View style={styles.miniCheckDot} />}
      </View>
      <Text style={[styles.miniTaskText, isDone && styles.miniTaskTextDone]} numberOfLines={1}>
        {task.title}
      </Text>
      {isDoing && <IconSymbol name="clock.fill" size={14} color={Colors.note} />}
    </View>
  );
}

function MiniTransaction({ item, isLast }: { item: ListItem; isLast: boolean }) {
  const isIncome = item.type === 'income';
  const color = isIncome ? Colors.income : Colors.expense;
  const bg = isIncome ? Colors.incomeSurf : Colors.expenseSurf;
  const icon = (CATEGORY_ICONS[item.category] ?? 'dollarsign.circle.fill') as CategoryIcon;
  const dateLabel = isIncome ? item.date : item.purchase_date;

  return (
    <View style={[styles.miniTxn, !isLast && styles.miniTxnBorder]}>
      <View style={[styles.miniTxnIcon, { backgroundColor: bg }]}>
        <IconSymbol name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.miniTxnName}>{item.category}</Text>
        <Text style={styles.miniTxnMeta}>{item.payment_type} · {dateLabel}</Text>
      </View>
      <Text style={[styles.miniTxnAmt, { color }]}>
        {isIncome ? '+' : '−'}{formatCurrency(item.amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: 16 },

  header: { paddingTop: 60, paddingBottom: 18 },
  greeting: { fontSize: 15, color: Colors.t3, fontFamily: Fonts.bodyMd },
  greetingName: { fontSize: 28, fontFamily: Fonts.display, color: Colors.t1, letterSpacing: -0.8, marginTop: 2 },

  weekStrip: { flexDirection: 'row', gap: 5, marginBottom: 16 },
  weekDay: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: Radius.sm, gap: 5 },
  weekDayToday: { backgroundColor: Colors.brandDim, borderWidth: 1, borderColor: 'rgba(124,111,255,0.3)' },
  weekDayLetter: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.t3, letterSpacing: 0.5 },
  weekDayLetterToday: { color: Colors.t2 },
  weekDayNum: { fontFamily: Fonts.display, fontSize: 14, color: Colors.t2 },
  weekDayNumToday: { color: Colors.brandLt },
  weekDot: { width: 4, height: 4, borderRadius: 2 },

  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.bdr,
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
    backgroundColor: Colors.bdr,
    marginHorizontal: 8,
  },
  streakValue: {
    fontFamily: Fonts.display,
    fontSize: 20,
    color: Colors.t1,
    lineHeight: 22,
  },
  streakLabel: {
    fontFamily: Fonts.mono,
    fontSize: 8,
    color: Colors.t3,
    letterSpacing: 0.5,
  },

  balanceCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: 22,
    borderWidth: 1, borderColor: 'rgba(124,111,255,0.22)', marginBottom: 14, overflow: 'hidden',
  },
  balanceCardGlow: {
    position: 'absolute', top: -60, right: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(124,111,255,0.10)',
  },
  balanceLbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  balanceAmount: { fontFamily: Fonts.display, fontSize: 40, color: Colors.t1, letterSpacing: -2, lineHeight: 44, marginBottom: 18 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBlock: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.sm, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  statVal: { fontFamily: Fonts.heading, fontSize: 14, color: Colors.t1 },
  statLbl: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  statLblTxt: { fontFamily: Fonts.mono, fontSize: 9, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 0.8 },

  homeCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.bdr, padding: 18, marginBottom: 12,
  },
  homeCardHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  homeCardTitle: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1.2 },
  secAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  secActionTxt: { fontFamily: Fonts.bodySb, fontSize: 13, color: Colors.brandLt },

  emptyCard: { paddingVertical: 10, alignItems: 'center' },
  emptyCardTxt: { fontFamily: Fonts.body, fontSize: 13, color: Colors.t3 },

  miniTask: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  miniTaskBorder: { borderBottomWidth: 1, borderBottomColor: Colors.bdr },
  miniCheck: { width: 18, height: 18, borderRadius: 9, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  miniCheckDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.note },
  miniTaskText: { flex: 1, fontFamily: Fonts.bodyMd, fontSize: 13, color: Colors.t1 },
  miniTaskTextDone: { color: Colors.t3, textDecorationLine: 'line-through' },

  extraRow: { paddingTop: 8 },
  extraTxt: { fontFamily: Fonts.bodySb, fontSize: 12, color: Colors.brandLt },

  miniTxn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  miniTxnBorder: { borderBottomWidth: 1, borderBottomColor: Colors.bdr },
  miniTxnIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  miniTxnName: { fontFamily: Fonts.bodySb, fontSize: 13, color: Colors.t1 },
  miniTxnMeta: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, marginTop: 1 },
  miniTxnAmt: { fontFamily: Fonts.heading, fontSize: 13 },
});
