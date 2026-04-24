import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts, Radius, Shadow, TAB_HEIGHT } from '@/constants/design';

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
    days.push({
      letter: dayLetters[d.getDay()],
      num: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
}

export default function InicioScreen() {
  const [greeting, setGreeting] = useState(getGreeting());
  const weekDays = getWeekDays();

  useEffect(() => {
    const id = setInterval(() => setGreeting(getGreeting()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.greeting}>{greeting}</Text>
          <Text style={s.greetingName}>João 👋</Text>
        </View>

        {/* Week strip */}
        <View style={s.weekStrip}>
          {weekDays.map((d, i) => (
            <View key={i} style={[s.weekDay, d.isToday && s.weekDayToday]}>
              <Text style={[s.weekDayLetter, d.isToday && s.weekDayLetterToday]}>{d.letter}</Text>
              <Text style={[s.weekDayNum, d.isToday && s.weekDayNumToday]}>{d.num}</Text>
              <View style={[s.weekDot, { backgroundColor: d.isToday ? Colors.brand : 'transparent' }]} />
            </View>
          ))}
        </View>

        {/* Balance card */}
        <View style={s.balanceCard}>
          <View style={s.balanceCardGlow} />
          <Text style={s.balanceLbl}>Saldo do mês</Text>
          <Text style={s.balanceAmount}>
            R$ 4.820<Text style={s.balanceCents}>,50</Text>
          </Text>
          <View style={s.statsRow}>
            <View style={s.statBlock}>
              <Text style={[s.statVal, { color: Colors.income }]}>R$ 7.200</Text>
              <View style={s.statLbl}>
                <IconSymbol name="arrow.up" size={12} color={Colors.income} />
                <Text style={s.statLblTxt}>Receitas</Text>
              </View>
            </View>
            <View style={s.statBlock}>
              <Text style={[s.statVal, { color: Colors.expense }]}>R$ 2.380</Text>
              <View style={s.statLbl}>
                <IconSymbol name="arrow.down" size={12} color={Colors.expense} />
                <Text style={s.statLblTxt}>Despesas</Text>
              </View>
            </View>
            <View style={s.statBlock}>
              <Text style={[s.statVal, { color: Colors.brandLt }]}>67%</Text>
              <View style={s.statLbl}>
                <IconSymbol name="banknote.fill" size={12} color={Colors.brandLt} />
                <Text style={s.statLblTxt}>Poupança</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Today tasks */}
        <View style={s.homeCard}>
          <View style={s.homeCardHdr}>
            <Text style={s.homeCardTitle}>TAREFAS DE HOJE</Text>
            <TouchableOpacity style={s.secAction} onPress={() => router.replace('/routine')}>
              <IconSymbol name="checkmark.circle.fill" size={14} color={Colors.brandLt} />
              <Text style={s.secActionTxt}>Ver tudo</Text>
            </TouchableOpacity>
          </View>
          <MiniTask done title="Revisar relatório mensal" />
          <MiniTask progress title="Reunião com equipe às 15h" />
          <MiniTask title="Pagar contas do mês" last />
        </View>

        {/* Recent transactions */}
        <View style={[s.homeCard, { marginBottom: 0 }]}>
          <View style={s.homeCardHdr}>
            <Text style={s.homeCardTitle}>ÚLTIMAS MOVIMENTAÇÕES</Text>
            <TouchableOpacity style={s.secAction} onPress={() => router.replace('/finance')}>
              <IconSymbol name="wallet.pass.fill" size={14} color={Colors.brandLt} />
              <Text style={s.secActionTxt}>Ver tudo</Text>
            </TouchableOpacity>
          </View>
          <MiniTransaction icon="briefcase.fill" name="Salário" meta="25 abr · Conta" amount="+R$ 5.000" isIncome />
          <MiniTransaction icon="cart.fill" name="Supermercado" meta="24 abr · Débito" amount="-R$ 340" last />
        </View>

        <View style={{ height: TAB_HEIGHT + 80 }} />
      </ScrollView>

      {/* FAB */}
      <View style={s.fabWrap}>
        <TouchableOpacity style={s.fabBtn} activeOpacity={0.85} onPress={() => router.replace('/routine')}>
          <IconSymbol name="plus" size={18} color="#fff" />
          <Text style={s.fabTxt}>Criar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MiniTask({ title, done, progress, last }: { title: string; done?: boolean; progress?: boolean; last?: boolean }) {
  const checkBg = done ? Colors.income : progress ? 'rgba(245,185,78,0.12)' : 'transparent';
  const checkBorder = done ? Colors.income : progress ? Colors.note : Colors.t3;
  return (
    <View style={[s.miniTask, !last && s.miniTaskBorder]}>
      <View style={[s.miniCheck, { backgroundColor: checkBg, borderColor: checkBorder, borderWidth: done ? 0 : 1.5 }]}>
        {done && <IconSymbol name="checkmark" size={10} color="#fff" />}
        {progress && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.note }} />}
      </View>
      <Text style={[s.miniTaskText, done && s.miniTaskTextDone]}>{title}</Text>
      {progress && <IconSymbol name="clock.fill" size={14} color={Colors.note} />}
    </View>
  );
}

function MiniTransaction({ icon, name, meta, amount, isIncome, last }: {
  icon: any; name: string; meta: string; amount: string; isIncome?: boolean; last?: boolean;
}) {
  const color = isIncome ? Colors.income : Colors.expense;
  const bg = isIncome ? Colors.incomeSurf : Colors.expenseSurf;
  return (
    <View style={[s.miniTxn, !last && { marginBottom: 6 }]}>
      <View style={[s.miniTxnIcon, { backgroundColor: bg }]}>
        <IconSymbol name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.miniTxnName}>{name}</Text>
        <Text style={s.miniTxnMeta}>{meta}</Text>
      </View>
      <Text style={[s.miniTxnAmt, { color }]}>{amount}</Text>
    </View>
  );
}

const s = StyleSheet.create({
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

  balanceCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(124,111,255,0.22)',
    marginBottom: 14,
    overflow: 'hidden',
    // gradient via tint on bg
    backgroundImage: undefined,
  },
  balanceCardGlow: {
    position: 'absolute', top: -60, right: -60,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(124,111,255,0.10)',
  },
  balanceLbl: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 6 },
  balanceAmount: { fontFamily: Fonts.display, fontSize: 40, color: Colors.t1, letterSpacing: -2, lineHeight: 44, marginBottom: 18 },
  balanceCents: { fontFamily: Fonts.heading, fontSize: 22, color: Colors.t2 },
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

  miniTask: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  miniTaskBorder: { borderBottomWidth: 1, borderBottomColor: Colors.bdr },
  miniCheck: { width: 18, height: 18, borderRadius: 9, flexShrink: 0, alignItems: 'center', justifyContent: 'center' },
  miniTaskText: { flex: 1, fontFamily: Fonts.bodyMd, fontSize: 13, color: Colors.t1 },
  miniTaskTextDone: { color: Colors.t3, textDecorationLine: 'line-through' },

  miniTxn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniTxnIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  miniTxnName: { fontFamily: Fonts.bodySb, fontSize: 13, color: Colors.t1 },
  miniTxnMeta: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.t3, marginTop: 1 },
  miniTxnAmt: { fontFamily: Fonts.heading, fontSize: 13 },

  fabWrap: { position: 'absolute', bottom: 14, left: 16, right: 16 },
  fabBtn: {
    backgroundColor: Colors.brand, borderRadius: Radius.md,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    ...Shadow.brand,
  },
  fabTxt: { fontFamily: Fonts.display, fontSize: 16, color: '#fff', letterSpacing: -0.2 },
});
