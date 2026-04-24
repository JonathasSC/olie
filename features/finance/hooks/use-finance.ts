import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { ListItem, Period } from '../types';
import { FinanceRepository } from '../services/finance-repository';
import { FinanceService } from '../services/finance-service';

export function useFinance() {
  const [items, setItems] = useState<ListItem[]>(() => FinanceRepository.listAll());
  const [period, setPeriod] = useState<Period>('mes');
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

  const addIncome = useCallback(async (data: Parameters<typeof FinanceRepository.insertIncome>[0]) => {
    setIsSaving(true);
    try {
      FinanceRepository.insertIncome(data);
      refresh();
      return true;
    } catch (e) {
      Alert.alert('Error', String(e));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [refresh]);

  const addExpense = useCallback(async (data: Parameters<typeof FinanceRepository.insertExpense>[0]) => {
    setIsSaving(true);
    try {
      FinanceRepository.insertExpense(data);
      refresh();
      return true;
    } catch (e) {
      Alert.alert('Error', String(e));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [refresh]);

  const removeItem = useCallback((item: ListItem) => {
    if (!item.id) return;
    
    Alert.alert('Remove', 'Do you want to remove this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => {
          if (item.nature === 'income') {
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
