import { INVESTMENT_CATEGORIES } from '../constants/finance-form-config';
import { FinanceGroup, FinanceSummary, ListItem, Period } from '../types';
import { startOfDay, getItemDate, parseDMY } from '../utils/formatters';

export const FinanceService = {
  filterByPeriod(items: ListItem[], period: Period): ListItem[] {
    const now = new Date();
    const today = startOfDay(now);

    return items.filter((item) => {
      const d = parseDMY(getItemDate(item));
      if (!d) return false;
      const day = startOfDay(d);

      if (period === 'today') return day.getTime() === today.getTime();

      if (period === 'week') {
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return day >= start;
      }

      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  },

  groupByDate(items: ListItem[]): FinanceGroup[] {
    const now = new Date();
    const today = startOfDay(now);
    const yesterday = startOfDay(new Date(today.getTime() - 86400000));

    const map = new Map<string, FinanceGroup>();

    for (const item of items) {
      const d = parseDMY(getItemDate(item));
      if (!d) continue;
      const day = startOfDay(d);
      const t = day.getTime();

      const dd = String(day.getDate()).padStart(2, '0');
      const mm = String(day.getMonth() + 1).padStart(2, '0');
      const sortKey = `${day.getFullYear()}-${mm}-${dd}`;

      let label: string;
      if (t === today.getTime()) { label = 'Hoje'; }
      else if (t === yesterday.getTime()) { label = 'Ontem'; }
      else { label = `${dd}/${mm}/${day.getFullYear()}`; }

      if (!map.has(sortKey)) map.set(sortKey, { label, sortKey, items: [] });
      map.get(sortKey)!.items.push(item);
    }

    return [...map.values()].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  },

  calculateSummary(items: ListItem[]): FinanceSummary {
    const investmentSet = new Set<string>(INVESTMENT_CATEGORIES);

    let totalIncomes = 0;
    let totalInvestments = 0;
    let totalExpenses = 0;

    for (const item of items) {
      if (item.type === 'expense') {
        totalExpenses += item.amount;
      } else if (investmentSet.has(item.category)) {
        totalInvestments += item.amount;
      } else {
        totalIncomes += item.amount;
      }
    }

    return {
      totalIncomes,
      totalExpenses,
      totalInvestments,
      balance: totalIncomes - totalExpenses - totalInvestments,
    };
  },

  getDailyExpenses(items: ListItem[], days = 7): Array<{ x: string; y: number }> {
    const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const now = new Date();

    return Array.from({ length: days }, (_, i) => {
      const date = startOfDay(new Date(now.getTime() - (days - 1 - i) * 86400000));
      const label = i === days - 1 ? 'Hoje' : DAYS_PT[date.getDay()];
      const total = items
        .filter((item) => item.type === 'expense')
        .filter((item) => {
          const d = parseDMY(getItemDate(item));
          return d && startOfDay(d).getTime() === date.getTime();
        })
        .reduce((sum, item) => sum + item.amount, 0);

      return { x: label, y: total };
    });
  },

  computeTop3(expenses: ListItem[]): { category: string; total: number }[] {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return [...map.entries()]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  },

  generateInsights(filtered: ListItem[], all: ListItem[]): string[] {
    const expensesFilter = filtered.filter((i) => i.type === 'expense');
    const result: string[] = [];

    if (expensesFilter.length > 0) {
      const byCat = new Map<string, number>();
      expensesFilter.forEach((g) => byCat.set(g.category, (byCat.get(g.category) ?? 0) + g.amount));
      const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];
      if (top) result.push(`Maior gasto: ${top[0]}`);
    }

    const now = new Date();
    const spentToday = all
      .filter((i) => i.type === 'expense')
      .filter((i) => {
        const d = parseDMY(getItemDate(i));
        return d && d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, i) => s + i.amount, 0);

    if (spentToday > 0) result.push(`Total gasto hoje: R$ ${spentToday.toFixed(2)}`);

    return result;
  }
};
