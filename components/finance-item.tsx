import { Ionicons } from '@expo/vector-icons';
import React from "react";
import { StyleSheet, Text, View } from "react-native";



interface FinanceItemProps {
  type: 'income' | 'expense' | 'investment';
  category: string;
  title: string;
  amount: number;
}

export default function FinanceItem({ type, category, title, amount }: FinanceItemProps) {
  const config = {
    income: {
      icon: 'trending-up' as const,
      color: '#2ada73',
      prefix: '+',
    },
    expense: {
      icon: 'trending-down' as const,
      color: '#ff6e6e',
      prefix: '-',
    },
    investment: {
      icon: 'stats-chart' as const,
      color: '#ffdd55',
      prefix: '',
    },
  };

  const { icon, color, prefix } = config[type];

  return (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <View style={styles.iconContainer}> 
          <Ionicons name={icon} size={18} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.textCategory}>{category}</Text>
          <Text style={styles.textTitle}>{title}</Text>
        </View>
      </View>
      <Text style={[styles.amountText, { color }]}>
        {prefix} R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemLeft:{
        gap: 16, 
        flexDirection: 'row',
        alignItems: 'center'
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0'
    },
    textContainer: {
        alignItems: 'flex-start'
    },
    textCategory: {
        fontWeight: 600
    },
    textTitle: {
        fontSize: 12,
    },
    amountText: {
        fontWeight: 600,
        fontSize: 14,
    }
});