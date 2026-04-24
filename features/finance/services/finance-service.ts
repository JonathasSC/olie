import { FinanceGroup, ListItem, Period, FinanceSummary } from '../types';
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

      let label: string;
      let sortKey: string;
      if (t === today.getTime()) { label = 'Today'; sortKey = 'z_today'; }
      else if (t === yesterday.getTime()) { label = 'Yesterday'; sortKey = 'z_yesterday'; }
      else {
        const dd = String(day.getDate()).padStart(2, '0');
        const mm = String(day.getMonth() + 1).padStart(2, '0');
        label = `${dd}/${mm}/${day.getFullYear()}`;
        sortKey = `${day.getFullYear()}-${mm}-${dd}`;
      }

      if (!map.has(sortKey)) map.set(sortKey, { label, sortKey, items: [] });
      map.get(sortKey)!.items.push(item);
    }

    return [...map.values()].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
  },

  calculateSummary(items: ListItem[]): FinanceSummary {
    const totalIncomes = items
      .filter((i) => i.type === 'income')
      .reduce((s, i) => s + i.amount, 0);
    
    const totalExpenses = items
      .filter((i) => i.type === 'expense')
      .reduce((s, i) => s + i.amount, 0);

    return {
      totalIncomes,
      totalExpenses,
      balance: totalIncomes - totalExpenses,
    };
  },

  generateInsights(filtered: ListItem[], all: ListItem[]): string[] {
    const expensesFilter = filtered.filter((i) => i.type === 'expense');
    const result: string[] = [];

    if (expensesFilter.length > 0) {
      const byCat = new Map<string, number>();
      expensesFilter.forEach((g) => byCat.set(g.category, (byCat.get(g.category) ?? 0) + g.amount));
      const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];
      if (top) result.push(`Highest expense: ${top[0]}`);
    }

    const now = new Date();
    const spentToday = all
      .filter((i) => i.type === 'expense')
      .filter((i) => {
        const d = parseDMY(getItemDate(i));
        return d && d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, i) => s + i.amount, 0);

    if (spentToday > 0) result.push(`Total spent today: $ ${spentToday.toFixed(2)}`);

    return result;
  }
};
