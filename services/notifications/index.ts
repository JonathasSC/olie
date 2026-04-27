import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Task, TaskRecurrence } from '@/features/routine/types';

// Show alerts even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CHANNEL_ID = 'reminders';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Lembretes',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
    enableLights: true,
  });
}

function notificationBody(recurrence: TaskRecurrence, time: string): string {
  switch (recurrence) {
    case 'daily':   return `Tarefa diária · ${time}`;
    case 'weekly':  return `Tarefa semanal · ${time}`;
    case 'monthly': return `Tarefa mensal · ${time}`;
    default:        return `Lembrete · ${time}`;
  }
}

type Trigger = Notifications.SchedulableNotificationTriggerInput;

function buildTrigger(task: Task): Trigger | null {
  if (!task.reminder_time || !task.date) return null;

  const [hour, minute] = task.reminder_time.split(':').map(Number);
  const [day, month, year] = task.date.split('/').map(Number);

  switch (task.recurrence) {

    case 'daily':
      return {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      };

    case 'weekly': {
      // weekday: 1 = Sunday … 7 = Saturday (expo-notifications convention)
      const weekday = new Date(year, month - 1, day).getDay() + 1;
      return {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      };
    }

    case 'monthly':
      // MONTHLY trigger is iOS-only; Android uses CALENDAR with repeats
      if (Platform.OS === 'ios') {
        return {
          type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
          day,
          hour,
          minute,
        };
      }
      return {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        day,
        hour,
        minute,
        repeats: true,
      };

    default: { // 'none' — one-time notification at the exact date/time
      const fireAt = new Date(year, month - 1, day, hour, minute, 0);
      if (fireAt <= new Date()) return null;
      return {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireAt,
      };
    }
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const NotificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;
    await ensureAndroidChannel();
    return true;
  },

  async scheduleTaskReminder(task: Task): Promise<string | null> {
    const trigger = buildTrigger(task);
    if (!trigger) return null;

    return Notifications.scheduleNotificationAsync({
      content: {
        title: task.title,
        body: notificationBody(task.recurrence ?? 'none', task.reminder_time!),
        sound: true,
        data: { taskId: task.id },
      },
      trigger,
    });
  },

  async cancelReminder(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },
};
