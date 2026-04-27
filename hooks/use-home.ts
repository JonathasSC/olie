import { useCallback, useMemo, useState } from 'react';

import { FinanceRepository } from '@/features/finance/services/finance-repository';
import { FinanceService } from '@/features/finance/services/finance-service';
import { ListItem, FinanceSummary } from '@/features/finance/types';
import { getItemDate, parseDMY } from '@/features/finance/utils/formatters';

import { RoutineRepository } from '@/features/routine/services/routine-repository';
import { Task, StreakData } from '@/features/routine/types';
import { getTodayDate } from '@/features/routine/utils/formatters';
import { StreakRepository } from '@/services/streak';

export interface HomeData {
  today: string;
  todayTasks: Task[];
  monthSummary: FinanceSummary;
  recentTransactions: ListItem[];
  streak: StreakData;
  refresh: () => void;
}

export function useHome(): HomeData {
  const today = getTodayDate();

  const [allTasks, setAllTasks] = useState<Task[]>(() => RoutineRepository.listAllTasks());
  const [allItems, setAllItems] = useState<ListItem[]>(() => FinanceRepository.listAll());
  const [streak, setStreak] = useState<StreakData>(() => StreakRepository.get());

  const refresh = useCallback(() => {
    setAllTasks(RoutineRepository.listAllTasks());
    setAllItems(FinanceRepository.listAll());
    setStreak(StreakRepository.get());
  }, []);

  const todayTasks = useMemo(
    () => allTasks.filter(task => task.date === today),
    [allTasks, today]
  );

  const monthSummary = useMemo((): FinanceSummary => {
    const monthItems = FinanceService.filterByPeriod(allItems, 'month');
    return FinanceService.calculateSummary(monthItems);
  }, [allItems]);

  const recentTransactions = useMemo(
    () =>
      [...allItems]
        .sort((a, b) => {
          const dA = parseDMY(getItemDate(a));
          const dB = parseDMY(getItemDate(b));
          if (!dA || !dB) return 0;
          return dB.getTime() - dA.getTime();
        })
        .slice(0, 3),
    [allItems]
  );

  return { today, todayTasks, monthSummary, recentTransactions, streak, refresh };
}
