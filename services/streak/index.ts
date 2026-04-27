import { getDatabase } from '@/services/db';
import type { StreakData } from '@/features/routine/types';

interface StreakRow {
  current_streak: number;
  best_streak: number;
  last_used_date: string | null;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export const StreakRepository = {
  get(): StreakData {
    const row = getDatabase().getFirstSync<StreakRow>(
      'SELECT current_streak, best_streak, last_used_date FROM streak WHERE id = 1'
    );
    if (!row) return { currentStreak: 0, bestStreak: 0, lastUsedDate: null };
    return {
      currentStreak: row.current_streak,
      bestStreak: row.best_streak,
      lastUsedDate: row.last_used_date,
    };
  },

  recordUsage(): void {
    const db = getDatabase();
    const row = db.getFirstSync<StreakRow>(
      'SELECT current_streak, best_streak, last_used_date FROM streak WHERE id = 1'
    );
    const today = todayISO();

    if (!row) {
      db.runSync(
        'INSERT OR REPLACE INTO streak (id, current_streak, best_streak, last_used_date) VALUES (1, 1, 1, ?)',
        today
      );
      return;
    }

    if (row.last_used_date === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString().split('T')[0];

    const newCurrent = row.last_used_date === yesterdayISO ? row.current_streak + 1 : 1;
    const newBest = Math.max(newCurrent, row.best_streak);

    db.runSync(
      'UPDATE streak SET current_streak = ?, best_streak = ?, last_used_date = ? WHERE id = 1',
      newCurrent, newBest, today
    );
  },
};
