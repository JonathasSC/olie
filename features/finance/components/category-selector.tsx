import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  items: string[];
  value: string;
  accent: string;
  onChange: (item: string) => void;
}

export function CategorySelector({ items, value, accent, onChange }: Props) {
  return (
    <View style={styles.row}>
      {items.map((item) => {
        const active = value === item;
        return (
          <TouchableOpacity
            key={item}
            style={[styles.chip, active && { borderColor: '#000', backgroundColor: '#000' + '1A' }]}
            onPress={() => onChange(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.text, active && { color: '#000', fontWeight: '600' }]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
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
