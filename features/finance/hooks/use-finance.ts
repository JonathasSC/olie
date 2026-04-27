import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ListItem, Period } from '../types';
import { FinanceRepository } from '../services/finance-repository';
import { FinanceService } from '../services/finance-service';
import { StreakRepository } from '@/services/streak';

export function useFinance() {
  const [items, setItems] = useState<ListItem[]>(() => FinanceRepository.listAll());
  const [period, setPeriod] = useState<Period>('month');
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(() => {
    setItems(FinanceRepository.listAll());
  }, []);

  const filteredItems = useMemo(() =>
    FinanceService.filterByPeriod(items, period),
    [items, period]
  );

  const summary = useMemo(() =>
    FinanceService.calculateSummary(filteredItems),
    [filteredItems]
  );

  const groupedItems = useMemo(() =>
    FinanceService.groupByDate(filteredItems),
    [filteredItems]
  );

  const insights = useMemo(() =>
    FinanceService.generateInsights(filteredItems, items),
    [filteredItems, items]
  );

  const addIncome = useCallback(async (data: Parameters<typeof FinanceRepository.addIncome>[0]) => {
    setIsSaving(true);
    try {
      FinanceRepository.addIncome(data);
      StreakRepository.recordUsage();
      refresh();
      return true;
    } catch (e) {
      Alert.alert('Erro', String(e));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [refresh]);

  const addExpense = useCallback(async (data: Parameters<typeof FinanceRepository.addExpense>[0]) => {
    setIsSaving(true);
    try {
      FinanceRepository.addExpense(data);
      StreakRepository.recordUsage();
      refresh();
      return true;
    } catch (e) {
      Alert.alert('Erro', String(e));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [refresh]);

  const removeItem = useCallback((item: ListItem) => {
    if (!item.id) return;

    Alert.alert('Remover', 'Deseja remover este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: () => {
          if (item.type === 'income') {
            FinanceRepository.deleteIncome(item.id!);
          } else {
            FinanceRepository.deleteExpense(item.id!);
          }
          refresh();
        },
      },
    ]);
  }, [refresh]);

  return {
    items,
    filteredItems,
    summary,
    groupedItems,
    insights,
    period,
    setPeriod,
    isSaving,
    addIncome,
    addExpense,
    removeItem,
    refresh,
  };
}
