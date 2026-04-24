import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Fonts, Radius } from '@/constants/design';
import { Period } from '../types';

interface PeriodFilterProps {
  period: Period;
  onPeriodChange: (p: Period) => void;
}

export function PeriodFilter({ period, onPeriodChange }: PeriodFilterProps) {
  const options: { key: Period; label: string }[] = [
    { key: 'today',  label: 'Hoje' },
    { key: 'week',   label: 'Semana' },
    { key: 'month',  label: 'Mês' },
  ];

  return (
    <View style={s.row}>
      {options.map(({ key, label }) => {
        const active = period === key;
        return (
          <TouchableOpacity
            key={key}
            style={[s.btn, active && s.btnActive]}
            onPress={() => onPeriodChange(key)}
            activeOpacity={0.75}
          >
            <Text style={[s.txt, active && s.txtActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  btn: {
    flex: 1, paddingVertical: 8, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.bdr,
    backgroundColor: 'transparent', alignItems: 'center',
  },
  btnActive: { backgroundColor: Colors.brandDim, borderColor: 'rgba(124,111,255,0.4)' },
  txt: { fontFamily: Fonts.bodyBd, fontSize: 12, color: Colors.t3 },
  txtActive: { color: Colors.brandLt },
});
