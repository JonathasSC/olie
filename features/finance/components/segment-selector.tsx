import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  accent: string;
  onChange: (value: string) => void;
}

export function SegmentSelector({ options, value, accent, onChange }: Props) {
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.segment, active && { borderColor: '#000', backgroundColor: '#000' + '1A' }]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, active && { color: '#000', fontWeight: '600' }]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8a8a8a',
  },
});
