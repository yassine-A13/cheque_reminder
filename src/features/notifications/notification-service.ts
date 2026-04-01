import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { Cheque } from '@/core/types/cheque';
import { formatAmount } from '@/utils/format';

const REMINDER_CHANNEL_ID = 'cheque-reminders';
const REMINDER_OFFSET_MS = 48 * 60 * 60 * 1000;

type NotificationPermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
};

type ChequeReminderPayload = Pick<Cheque, 'beneficiary' | 'amount' | 'dueDate' | 'chequeNumber'>;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldSetBadge: false,
  }),
});

function computeReminderDate(dueDate: string) {
  const dueTimestamp = new Date(dueDate).getTime();

  if (Number.isNaN(dueTimestamp)) {
    return null;
  }

  const reminderTimestamp = dueTimestamp - REMINDER_OFFSET_MS;

  if (reminderTimestamp <= Date.now()) {
    return null;
  }

  return new Date(reminderTimestamp);
}

export async function requestNotificationPermissions(): Promise<NotificationPermissionResult> {
  const existing = await Notifications.getPermissionsAsync();

  if (existing.granted) {
    return {
      granted: true,
      canAskAgain: existing.canAskAgain,
    };
  }

  const requested = await Notifications.requestPermissionsAsync();

  return {
    granted: requested.granted,
    canAskAgain: requested.canAskAgain,
  };
}

export async function initializeNotifications() {
  await requestNotificationPermissions();

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Rappels chèques',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0F766E',
    });
  }
}

export async function scheduleChequeNotification(cheque: ChequeReminderPayload) {
  const triggerDate = computeReminderDate(cheque.dueDate);

  if (!triggerDate) {
    return null;
  }

  const permissions = await Notifications.getPermissionsAsync();

  if (!permissions.granted) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Rappel Chèque',
      body: `Le chèque de ${formatAmount(cheque.amount)} pour ${cheque.beneficiary} arrive dans 48h.`,
      data: {
        chequeNumber: cheque.chequeNumber,
        dueDate: cheque.dueDate,
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
}

export async function cancelChequeNotification(notificationId?: string | null) {
  if (!notificationId) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Ignore stale notification ids to keep CRUD flows resilient.
  }
}

export async function rescheduleChequeNotification(
  cheque: ChequeReminderPayload,
  previousNotificationId?: string | null,
) {
  await cancelChequeNotification(previousNotificationId);
  return scheduleChequeNotification(cheque);
}
